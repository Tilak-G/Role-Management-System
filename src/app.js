// const { log } = require("console");
require('dotenv').config();
const express=require("express");
const app=express();
const path=require("path");
require("./db/conn"); 
const Register=require("./models/registers");

const hbs=require("hbs");
const bcrypt=require("bcryptjs");

const port=process.env.PORT || 3000;

// console.log(path.join(__dirname,"../public"));
const path_static=path.join(__dirname,"../public")
const template_path=path.join(__dirname,"../templates/views")
const partials_path=path.join(__dirname,"../templates/partials");


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path_static));
app.set("view engine", "hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);
 
// console.log(process.env.SECRET_KEY);

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

//create anew user for database
app.post("/register", async(req,res)=>{
    try{
        // console.log(req.body.firstname);
        // res.send(req.body.firstname);

        const password= req.body.password;
        const cpassword= req.body.confirmpassword;

        if(password == cpassword ){
            const registerEmployee=new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:password,
                confirmpassword:cpassword
            })

            console.log("success part"+ registerEmployee);

            const token =await registerEmployee.generateAuthToken();
            console.log("the token part"+token);


            //adding cookie

            res.cookie("jwt",token,{
                expires: new Date(Date.now()+30000),
                httpOnly: true
            });
            console.log(cookie);

            //password hash


            const registered=await registerEmployee.save();
            console.log("the page part" +registered);
            res.status(201).render("index");
        }else{
            res.send("password are not matching");
        }


    }catch(e){
        res.status(400).send(e);
    }
})

app.post("/login", async(req,res)=>{
    try{

        const email=req.body.email;
        const password=req.body.password;
        // console.log(`${email} and passeord is ${password}`);


        const useremail = await Register.findOne({email:email});
        // req.send(useremail.password);
        // console.log(useremail);

        const isMatch= await bcrypt.compare(password,useremail.password);

        const token =await useremail.generateAuthToken();
        console.log("the token part"+token);

        //adding cookie

        res.cookie("jwt",token,{
            expires: new Date(Date.now()+50000),
            httpOnly: true
            // secure:true
        });
        console.log(cookie);


        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send(error);
        }
    }
    catch(error){
        res.status(400).send("invalid login details");
    }
})

// const jwt =require("jsonwebtoken");

// const createToken= async()=>{
//     const token =await jwt.sign({_id:"6450af6f164936dce2fdd158"},"dtdhgjhkhttdseaesxcvhgggkjuiyuoommvcxfdrd",{
//         expiresIn: "2 min"
//     });
//     console.log(token);

//     const userVer=await jwt.verify(token,"dtdhgjhkhttdseaesxcvhgggkjuiyuoommvcxfdrd");
//     console.log(userVer);
// }

// createToken();


app.listen(port,()=>{
    console.log(`server is running at port ${port}`);
})