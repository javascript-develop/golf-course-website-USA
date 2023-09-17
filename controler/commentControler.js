const Comment = require("../modal/commentModal");

exports.commentpost=async (req, res) => {
    try {
      const { text } = req.body;
  
      // Save the comment to the database with a "pending" status
      const comment = new Comment({ text, status: 'pending' });
      await comment.save();
  
      res.status(201).json({ success: true, comment: { ...comment.toObject(), status: 'pending' } });
    } catch (error) {
      console.error('Error submitting comment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  exports.comments= async (req, res) => {
    try {
       const comments = await Comment.find();
       res.status(200).json({ success: true, comments });
     } catch (error) {
       console.error('Error fetching comments:', error);
       res.status(500).json({ success: false, message: 'Server error' });
     }
   };
   // pending function
let pendingcomments = [
  { _id: 1, text: 'Pending comment 1', status: 'pending' },
  { _id: 2, text: 'Pending comment 2', status: 'pending' },
];
exports.pendingcomments= async (req, res) => {
  try {
    // Fetch pending comments from the database
    const pendingComments = await Comment.find({ status: 'pending' });

    res.json({ pendingComments });
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.approveComment= async (req, res) => {
  const { id } = req.params;
  try {
    // Find the comment by ID and update its status to 'approved'
    const comment = await Comment.findByIdAndUpdate(id, { status: 'approved' });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.status(200).json({ success: true, message: 'Comment approved' });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.deletecomment=async (req, res) => {
  const { commentId } = req.body;

  try {
    // Delete the comment from the database by its ID
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};