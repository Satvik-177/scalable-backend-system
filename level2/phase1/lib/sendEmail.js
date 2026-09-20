const sendEmail = async(email)=>{

    await new Promise((resolve)=>{
        setTimeout(resolve,50000)
    })

    console.log("Task compeleted")
}

export default sendEmail