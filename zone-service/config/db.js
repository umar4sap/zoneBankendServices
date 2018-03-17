module.exports = {
    rethinkdb: {
        host: process.env.DB_HOST ||"159.65.15.180", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: "zoneapp",
    },
    tables: [
        {
            table: "zones",
            id:"zoneId"
        },
        {
            table: "members",
            id:"memberId"
        }
    ]
}
