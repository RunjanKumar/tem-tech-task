require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const port = process.env.PORT || 8001;

const multer = require("multer");
const admin = require('firebase-admin');
const serviceAccount = require('./tem-tech-task-firebase-adminsdk-1yr7k-370b12825f.json');

// Use morgan middleware for logging requests

const storage = multer.diskStorage({
    destination: "./public/upload",
    filename: function (req, file, cb) {
        cb(
            null,
            file.originalname
        );
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 10 },
}).single('file');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.STORAGE_BUCKET // Replace with your Firebase Storage bucket URL
});
const bucket = admin.storage().bucket();

const app = express();

/* MiddleWares */
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/fileUpload', upload, (req, res) => {
    bucket.upload(`./public/upload/${req.file.originalname}`, {
        destination: req.file.originalname,
    }).then(() => {
        console.log('Image uploaded successfully.');
    }).catch((error) => {
        console.error('Error uploading image:', error);
    });
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${req.file.originalname}`;
    return res.status(200).send(`File uploaded successfully. Public URL: ${publicUrl}`);
});



function fibo(n, memo = {}) {
    if (n <= 1) {
        return 1;
    }
    if (memo[n]) return memo[n];
    memo[n] = fibo(n - 1, memo) + fibo(n - 2, memo);
    return memo[n];
};


app.get('/fibonacci/:number', (req, res) => {
    const { number } = req.params;
    const value = fibo(Number(number));
    return res.status(200).send(`fibonacci of ${number} is ${value}`);

})


function isBalanced(str) {
    const charCounts = {};
    for (let char of str) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const counts = Object.values(charCounts);
    return counts[0] === counts[1];
}

function getBalancedSubstrings(S) {
    const n = S.length;
    const result = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 2; j <= n; j++) {
            const substr = S.substring(i, j);
            const uniqueChars = new Set(substr);
            if ((uniqueChars.size === 2) && isBalanced(substr)) {
                if (!result.length || substr.length > result[0].length) {
                    result.length = 0;
                    result.push(substr);
                } else if (substr.length === result[0].length) {
                    result.push(substr);
                }
            }
        }
    }
    return result;
}

app.get('/longestBalanceSubstring/:str', (req, res) => {
    const { str } = req.params;
    const value = getBalancedSubstrings(str);
    return res.status(200).send(`longest balance substriing of ${str} is [ ${value} ]`);
})

/* Start the server */
app.listen(port, () => console.log(`server is listening on ${port}`));