const { connect } = require('mongoose')
const config = require('../../utils/config')

const connectUri = config.mongoDatabase.mongoDatabaseConnectionUrl

const connectToMongoDatabase = () => {
    return connect(connectUri)
}

module.exports = {
    connectToMongoDatabase,
}
