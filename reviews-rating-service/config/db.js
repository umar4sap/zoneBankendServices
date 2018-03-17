module.exports = {
    rethinkdb: {
        host: process.env.DB_HOST ||"159.65.15.180", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: process.env.DB_NAME,
        min: process.env.MIN,
        max: process.env.MAX
    },
    tables: [
        {
            table: "reviewsandratings",
            id:"reviewId"
        }
    ]
}
