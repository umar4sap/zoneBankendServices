module.exports = {
    rethinkdb: {
        //host: "127.0.0.1",
        host:process.env.DB_HOST ||"localhost",
        //db host
        port:  28015,
        authKey: "",
        db: "zoneapp",
    },
    tables: [
        {
            table: "ownerships"
        }
    ]
}
