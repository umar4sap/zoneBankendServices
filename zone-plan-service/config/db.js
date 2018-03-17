module.exports = {
    rethinkdb: {
        host: process.env.DB_HOST || "159.65.15.180", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: process.env.DB_NAME || "zoneapp",
    },
    tables: [{
        table: "plans",
        id: "planId"
    }]
}
