let rec = require("../models/Book");
let act = require("../models/activity");
let data = require("../models/da");
const path = require("path");
const fs = require("fs");

exports.addbook = async (req, res) => {
  try {
    const image = req.files?.image?.[0]?.filename;
    const bookFile = req.files?.bookFile?.[0]?.filename;
    const book = new rec({
      bookId: req.body.bookId,
      bookName: req.body.bookName,
      description: req.body.description,
      author: req.body.author,
      quantity: req.body.quantity,
      category: req.body.category,
      ...(image && { image }),
      ...(bookFile && { bookFile }),
      status: 'Available',
    });

    await book.save();
    return res
      .status(201)
      .json({ success: true, msg: "Book added successfully" });
  } catch (err) {
    console.error(err);
    for (const file of [...(req.files?.image || []), ...(req.files?.bookFile || [])]) {
      fs.unlink(file.path, unlinkError => {
        if (unlinkError) console.error("Unable to remove failed book upload:", unlinkError);
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, msg: "A book with this Book ID already exists." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, msg: err.message });
    }
    return res
      .status(500)
      .json({ success: false, msg: "Error while adding the book" });
  }
};



exports.viewbook=async(req,res)=>
{
  let librarylist = await rec.find();
  console.log(librarylist);

  if (librarylist.length === 0) {
    return res.status(200).json({
      success: true,
      msg: 'No books found',
      book: [],
    });
  }

  return res.status(200).json({
    success: true,
    msg: 'All book details fetched successfully',
    book: librarylist,
  });
}

exports.readbook = async (req, res) => {
  try {
    const book = await rec.findById(req.params.id).select("bookFile");
    if (!book) {
      return res.status(404).json({ success: false, msg: "Book not found." });
    }
    if (!book.bookFile) {
      return res.status(404).json({ success: false, msg: "No reading file is available for this book." });
    }

    const filePath = path.resolve(__dirname, "../public/uploads", path.basename(book.bookFile));
    res.type("application/pdf");
    return res.sendFile(filePath, error => {
      if (error) {
        console.error("Error serving book PDF:", error);
        if (!res.headersSent) {
          res.status(error.statusCode || 500).json({ success: false, msg: "Unable to open this book file." });
        }
      }
    });
  } catch (error) {
    console.error("Error loading book PDF:", error);
    return res.status(500).json({ success: false, msg: "Unable to open this book file." });
  }
};


exports.deletebook=async(req,res)=>
{       console.log(req.params.id);
         let id=req.params.id;
        await rec.deleteOne({_id:id});
        return res.status(200).json({success:true,msg:"delete successfully!!"});
}



exports.issuebook = async (req, res) => {
    console.log("hello");
    try {
        const bookId = req.body.bookId;
        console.log(bookId);
        let student = req.adm; 
        console.log(student);

        if (!bookId) {
            return res.status(400).json({ success: false, msg: "Book ID is required." });
        }

        const alreadyIssued = await data.findOne({
            bookId: bookId,
            studentId: student.id,
            action: 'issued' 
        });

        if (alreadyIssued) {
            return res.status(400).json({ success: false, msg: "This book is already issued to this student and has not been returned yet." });
        }

        const book = await rec.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, msg: "Book not found in inventory." });
        }

        if (book.quantity < 1) {
            return res.status(400).json({ success: false, msg: "Book not available in stock." });
        }

        book.quantity -= 1;
        if (book.quantity === 0) {
            book.status = 'Not Available';
        }
        await book.save();

        const issueRecord = new data({
            bookId: bookId,
            studentId: student.id,
            studentName: student.name,
            action: 'issued',
            date: new Date()
        });

        const activity = new act({
            bookId: bookId,
            studentId: student.id,
            studentName: student.name,
            action: 'issued',
            date: new Date()
        });

        await issueRecord.save();
        await activity.save();

        return res.status(200).json({ success: true, msg: "Book issued successfully." });
    } catch (err) {
        console.error('Error while issuing book:', err);
        return res.status(500).json({ success: false, msg: "Internal server error while issuing book." });
    }
};

exports.issued = async (req, res) => {
  try {
    const student = req.adm; 

    console.log("Student ID:", student.id);

    const issuedBooks = await data.find({ studentId: student.id, action: 'issued' }).sort({ date: -1 });

    if (issuedBooks.length === 0) {
      return res.status(404).json({ success: false, msg: "No issued books found." });
    }
    return res.status(200).json({ success: true, books: issuedBooks });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "Error fetching issued books: " + err.message });
  }
};

exports.adminIssued = async (req, res) => {
  try {
    const issuedRecords = await data.find({ action: 'issued' }).sort({ date: -1 }).lean();
    const bookIds = [...new Set(issuedRecords.map(record => record.bookId))];
    const books = await rec.find({ _id: { $in: bookIds } }).select('bookName author').lean();
    const booksById = new Map(books.map(book => [String(book._id), book]));

    return res.status(200).json({
      success: true,
      books: issuedRecords.map(record => ({
        ...record,
        book: booksById.get(String(record.bookId)) || null,
      })),
    });
  } catch (err) {
    console.error('Error fetching admin issued books:', err);
    return res.status(500).json({ success: false, msg: 'Unable to fetch issued books.' });
  }
};



exports.returnbook = async (req, res) => {
    try {
       console.log(req.body);
        const bookId = req.body.bookId;
        let student = req.adm; 

        if (!bookId) {
            return res.status(400).json({ success: false, msg: "Book ID is required for return." });
        }
        const book = await rec.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, msg: "Book not found in inventory." });
        }

        const issueRecord = await data.findOne({
            bookId: bookId,
            studentId: student.id,
            action: 'issued'
        });
        
        if (!issueRecord) {
            return res.status(404).json({ success: false, msg: "This book was not found as issued to the current student or it was already returned." });
        }

        book.quantity += 1;
        if (book.quantity > 0) {
            book.status = 'Available';
        }
        await book.save();
        issueRecord.action = 'returned';
        issueRecord.returnDate = new Date(); 
        await issueRecord.save();
        const activity = new act({
            bookId: bookId,
            studentId: student.id,
            studentName: student.name,
            action: 'returned',
            date: new Date(),
        });
        await activity.save();

        return res.status(200).json({ success: true, msg: "Book returned successfully. Inventory updated." });

    } catch (err) {
        console.error('Error while returning the book:', err);
        return res.status(500).json({ success: false, msg: "Error while returning book: " + err.message });
    }
};