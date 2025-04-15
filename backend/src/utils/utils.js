const isValidISODate = (dateString) => {
    return typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString) && !isNaN(Date.parse(dateString));
};

const time2ts = (time) => {
    if (!time) return null;

    if (time instanceof Date) {
        return Math.floor(time.getTime() / 1000);
    }

    const parsedTime = new Date(time);
    if (isNaN(parsedTime.getTime())) {
        logger.error('Invalid date format:', time);
        return null;
    }
    return Math.floor(parsedTime.getTime() / 1000);
};

const ts2time = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000);
};

module.exports = { isValidISODate, time2ts, ts2time  };