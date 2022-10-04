const convertObjectBigIntKeysToNumber = (obj) => {
    return Object.keys(obj).reduce((memo, key) => {
        const dataByKey = obj[key]
        if (typeof dataByKey === 'bigint') {
            memo[key] = Number(dataByKey)
        } else {
            memo[key] = dataByKey
        }

        return memo
    }, {})
}

module.exports = {
    convertObjectBigIntKeysToNumber,
}
