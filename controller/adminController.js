



async function signup(req, res) {
    try {
      const admin = await Admin.findOne({ email: req.body.email });
      if (admin)
        return res.status(400).json({ message: "user already registered" });
  
      const { email, password, conform_password } = req.body;
      if (password !== conform_password) {
        return res.status(400).json({
          message: "Enter same password",
        });
      }
      const hash = await bcrypt.hash(password, 10);
      const _admin = new Admin({
        email,
        hash_password: hash,
      });
  
      _admin.save((error, data) => {
        if (error) {
          console.log("Error from: adminController >> signup", error.message);
          return res.status(400).json({
            message: "Somthing went wrong",
            error: error.message,
          });
        }
        if (data) {
          // sendMobileOtp(contact, message)
          return res.status(200).json({
            message: "user created successfully",
            data: data,
          });
        }
      });
    } catch (error) {
      console.log("Error from userController >> signup: ", error.message);
      return res.status(400).json({ message: "Somthing went wrong" });
    }
  }
  
  async function signin(req, res) {
    try {
      Admin.findOne({ email: req.body.email }).then(async (admin, error) => {
        if (error) return res.status(400).json({ error });
        if (admin) {
          let isValid = bcrypt.compareSync(
            req.body.password,
            admin.hash_password
          );
          if (isValid) {
            const { _id, email } = admin;
            const token = jwt.sign(
              { _id: admin._id, email: admin.email },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );
            return res.status(200).json({
              token,
              admin: {
                _id,
                email,
                owner_wallet_address
              },
            });
          } else {
            return res.status(400).json({
              message: "Invalide username and password",
            });
          }
        } else {
          return res.status(400).json({
            message: "Incorrect credentials, user not found.",
          });
        }
      });
    } catch (error) {
      console.log("Error from adminController >> signin: ", error.message);
      return res.status(400).json({ message: "Somthing went wrong" });
    }
  }


  module.exports = {
    signup,
    signin
  }