import Foundation
import Capacitor
import AuthenticationServices
import CryptoKit

// Custom Google Sign-In plugin using ASWebAuthenticationSession + PKCE.
//
// WHY: Firebase Web SDK's signInWithPopup/signInWithRedirect both hang in Capacitor
// WKWebView — popup windows can't postMessage back, and the pre-navigation async
// IndexedDB write never completes. ASWebAuthenticationSession opens a real Safari
// overlay that Google permits for OAuth, and it works in the iOS Simulator too.
//
// No external SDK needed: PKCE token exchange for iOS OAuth clients (type "iOS" in
// Google Cloud Console) does not require a client_secret per RFC 8252.

@objc(NativeGoogleAuthPlugin)
public class NativeGoogleAuthPlugin: CAPPlugin, CAPBridgedPlugin,
                                      ASWebAuthenticationPresentationContextProviding {
    public let identifier = "NativeGoogleAuthPlugin"
    public let jsName = "NativeGoogleAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise)
    ]

    // Values from ios/App/App/GoogleService-Info.plist
    private let clientId = "457163791884-jauqb0f1rubulf7ohcgnv77u7qgqqs1m.apps.googleusercontent.com"
    private let reversedClientId = "com.googleusercontent.apps.457163791884-jauqb0f1rubulf7ohcgnv77u7qgqqs1m"

    @objc func signIn(_ call: CAPPluginCall) {
        let redirectUri = "\(reversedClientId):/oauth2redirect"
        let verifier = pkceCodeVerifier()
        let challenge = pkceCodeChallenge(from: verifier)

        var components = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        components.queryItems = [
            URLQueryItem(name: "client_id",             value: clientId),
            URLQueryItem(name: "redirect_uri",          value: redirectUri),
            URLQueryItem(name: "response_type",         value: "code"),
            URLQueryItem(name: "scope",                 value: "openid profile email"),
            URLQueryItem(name: "code_challenge",        value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
        ]
        guard let authURL = components.url else {
            call.resolve(["error": "Failed to build Google OAuth URL"])
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let session = ASWebAuthenticationSession(
                url: authURL,
                callbackURLScheme: self.reversedClientId
            ) { callbackURL, error in
                if let error = error {
                    let code = (error as? ASWebAuthenticationSessionError)?.code
                    if code == .canceledLogin {
                        call.resolve(["error": "cancelled"])
                    } else {
                        call.resolve(["error": error.localizedDescription])
                    }
                    return
                }
                guard let url = callbackURL,
                      let code = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                          .queryItems?.first(where: { $0.name == "code" })?.value else {
                    call.resolve(["error": "No auth code in callback URL"])
                    return
                }
                self.exchangeCode(code, verifier: verifier, redirectUri: redirectUri) { result in
                    switch result {
                    case .success(let tokens): call.resolve(tokens)
                    case .failure(let err):    call.resolve(["error": err.localizedDescription])
                    }
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            session.start()
        }
    }

    // MARK: - ASWebAuthenticationPresentationContextProviding

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.keyWindow ?? UIWindow()
    }

    // MARK: - PKCE

    private func pkceCodeVerifier() -> String {
        var buf = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, buf.count, &buf)
        return Data(buf).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private func pkceCodeChallenge(from verifier: String) -> String {
        Data(SHA256.hash(data: Data(verifier.utf8))).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    // MARK: - Token exchange

    private func exchangeCode(_ code: String, verifier: String, redirectUri: String,
                               completion: @escaping (Result<[String: String], Error>) -> Void) {
        guard let tokenURL = URL(string: "https://oauth2.googleapis.com/token") else {
            completion(.failure(makeError("Invalid token URL"))); return
        }
        var req = URLRequest(url: tokenURL)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        let body: [(String, String)] = [
            ("grant_type",    "authorization_code"),
            ("code",          code),
            ("client_id",     clientId),
            ("redirect_uri",  redirectUri),
            ("code_verifier", verifier),
        ]
        req.httpBody = body
            .map { "\($0.0)=\(pctEncode($0.1))" }
            .joined(separator: "&")
            .data(using: .utf8)

        // No [weak self]: self is retained by the Capacitor bridge for the app lifetime,
        // and [weak self] + guard would silently eat the result if self were ever nil.
        URLSession.shared.dataTask(with: req) { data, _, error in
            if let error = error { completion(.failure(error)); return }
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let idToken = json["id_token"] as? String else {
                let bodyStr = data.flatMap { String(data: $0, encoding: .utf8) } ?? "empty"
                completion(.failure(NSError(domain: "NativeGoogleAuth", code: -1,
                    userInfo: [NSLocalizedDescriptionKey: "Token exchange failed: \(bodyStr)"])))
                return
            }
            completion(.success([
                "idToken":     idToken,
                "accessToken": json["access_token"] as? String ?? "",
            ]))
        }.resume()
    }

    private func pctEncode(_ s: String) -> String {
        s.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? s
    }

    private func makeError(_ msg: String) -> NSError {
        NSError(domain: "NativeGoogleAuth", code: -1,
                userInfo: [NSLocalizedDescriptionKey: msg])
    }
}
