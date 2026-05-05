async function reportRecall(productName, description, severity) {
  return {
    product: productName,
    description,
    severity,
    reportedAt: new Date().toISOString()
  };
}

async function aggregateRecalls(recalls) {
  return recalls.reduce((acc, recall) => {
    const key = recall.product || "Unknown Product";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(recall);
    return acc;
  }, {});
}

module.exports = { reportRecall, aggregateRecalls };
