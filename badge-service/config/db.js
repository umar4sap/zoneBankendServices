module.exports = {
    rethinkdb: {
        host: process.env.DB_HOST || "10.7.0.6", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: process.env.DB_NAME,
    },
    tables: [{
        table: "badges",
        id: "badgeId"
    }]
}
