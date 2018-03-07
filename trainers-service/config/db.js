module.exports = {
    rethinkdb: {
        host: process.env.DB_HOST || "localhost", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: process.env.DB_NAME || "zoneapp",
    },
    tables: [{
        table: "trainers",
        id: "trainerId"
    }]
}
