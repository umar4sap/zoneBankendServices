module.exports = {
    rethinkdb: {
        //host: "127.0.0.1",
        host: process.env.DB_HOST || "localhost",
        //db host
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: "zones_customerDB",
    },
    tables: [
        {
            table: "ownerships"
        }
    ]
}
