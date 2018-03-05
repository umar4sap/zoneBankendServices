module.exports = {
    rethinkdb: {
   //host: "127.0.0.1",    // local
    //host:"10.7.0.6", // for docker 
         host: process.env.DB_HOST ||"127.0.0.1", // for docker 
        port: process.env.DB_PORT || 28015,
        authKey: "",
        db: process.env.DB_NAME,
        min: process.env.MIN,
        max: process.env.MAX
    },
    tables: [
        {
            table: "authorbiography",
            id:"id"
        }
    ]
}
