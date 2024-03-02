const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('file'), (req, res) => {
  // Check if the uploaded file is a torrent file
  if (req.file && req.file.mimetype === 'application/x-bittorrent') {
    // Delete the torrent file instantly
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting file');
      }
      res.status(400).send('<script>alert("Torrent files are not allowed!"); window.location.href="/";</script>');
    });
  } else {
    // Assuming the uploaded file is of any type other than torrent
    const uploadedFileName = req.file.filename;
    const fileUrl = `/uploads/${uploadedFileName}`;

    // Redirect the user to the specific uploaded file page
    res.redirect(fileUrl);
  }
});

app.get('/search', (req, res) => {
  const searchResults = []; // Placeholder, replace with actual data
  res.render('search', { searchResults });
});

// Custom route to list files in the 'uploads' directory
app.get('/uploads', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      // Render a page with links to the files
      res.render('uploads', { files });
    }
  });
});

// Custom 404 error handler
app.use((req, res) => {
  res.status(404).render('404');
});

module.exports = app;
