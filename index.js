const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const app = express()
//General Controllers Sign
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
 
//Build In Controllers Sign
const UsersRouter = require("./Routes/Users")
const PaymentRouter = require("./Routes/Payement")
const ItemsRouter = require("./Routes/Items")
const DeliveryRouter = require("./Routes/Delivery")

//Literals
const PORT = process.env.PORT  
const mongoUrl = process.env.MONGO_URL
console.log(mongoUrl)

// Connnect to Database
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  useUnifiedTopology: true
})
const connections = mongoose.connection
connections.once("open", () => {
    console.log("Mongodb DB Successfully added !!")
})

// Controller Routes

app.use("/users", UsersRouter)
app.use("Items",ItemsRouter)
app.use("/Payment", PaymentRouter)
app.use("/Delivery", DeliveryRouter)


//Server Listen
app.listen(PORT,()=>{
    console.log(`Server is listning at PORT: ${PORT}`)
})

