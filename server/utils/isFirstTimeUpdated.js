function isFirstTimeUpdated(firstTime, secondTime) {
    const firstTimestamp = new Date(firstTime).getTime();
    const secondTimestamp = new Date(secondTime).getTime();
  
    return firstTimestamp > secondTimestamp;
}

exports.module = {
    isFirstTimeUpdated
}