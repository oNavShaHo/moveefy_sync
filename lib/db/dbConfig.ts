import mongoose from "mongoose";

export async function connect()
{
  try {
     mongoose.connect(process.env.MONGO_URL!);
     const connection = mongoose.connection;

     connection.on('connnected',()=>{
      console.log("connected");
     })

     connection.on('error',(error)=>{
      console.log(error);
     })

  } catch (error) {
     
    console.log("SomeThing gone wrong",error);

   }
}