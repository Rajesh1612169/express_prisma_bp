import prisma from "../DB/db.config.js";
import vine, {errors} from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";
class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema)
            const payload = await validator.validate(body)

            // Check if user exists
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
            })

            if(findUser) {
                return res.status(400).json({errors:{
                    email: "email Already Taken please use another email !!!!"
                }})
            }

            // encrypt password
            const salt = bcrypt.genSaltSync(10)
            payload.password = bcrypt.hashSync(payload.password, salt);
            const user = await prisma.users.create({
                data: payload
            })
            return res.json({ status: 200, message:'User Created Successfully', user })
        } catch (error) {
            console.log(error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({errors:error.messages})
            }else {
                res.status(500).json({status: 500, message: "something went wrong !!"})
            }
        }
    }

    static async login(req, res) {
        try {
            const body = req.body
            const validator = vine.compile(loginSchema)
            const payload = await validator.validate(body)

            // Find User with email
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
            })

            if(findUser) {
               if(!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({errors:{
                        email: "Invalid Credentials"
                    }})
               }

               const payloadData = {
                    id: findUser.id,
                    name: findUser.name,
                    email: findUser.email,
                    profile: findUser.profile,
               }
               const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                    expiresIn: '365d',
               })

               return res.json({ message: "Logged In", user: findUser,  access_token: `Bearer ${token}` })
            }

            return res.status(400).json({errors:{
                email: "No User found with this credentials !!!"
            }})
        } catch (error) {
            console.log(error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({errors:error.messages})
            }else {
                res.status(500).json({status: 500, message: "something went wrong !!"})
            }
        }
    }

    static async sendTestEmail(req, res) {
        try {
            const {email} = req.query;
            const payload = [
                {
                  toEmail: email,
                  subject: "Hey I am just testing",
                  body: "<h1>Hello World , I am from test cases.</h1>",
                },
                {
                  toEmail: email,
                  subject: "You got an amazing",
                  body: "<h1>Hello you got this amazing offer.</h1>",
                },
                {
                  toEmail: email,
                  subject: "Kadake ki pad rahi hai thand",
                  body: "<h1>Please apne ghar par rahe .</h1>",
                },
              ];
            await emailQueue.add(emailQueueName, payload);
        
            return res.json({status: 200, message: "Email Send Successfully !!!"});
        }catch(error) {
            console.log(error.message)
            logger.error({type: "Email Error !!", body: error});
            return res.status(500).json({message: "Something went wrong please try again !!!"});
        }
    }
}

export default AuthController;