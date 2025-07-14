import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import api from "../../config/axios";

export default function BiologiesGrid() {
  const [books, setBooks] = React.useState([]);
  const [chapters, setChapters] = React.useState([]);
  const [lessons, setLessons] = React.useState([]);
  const [biologies, setBiologies] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState("");
  const [selectedChapter, setSelectedChapter] = React.useState("");
  const [selectedLesson, setSelectedLesson] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailBio, setDetailBio] = React.useState(null);

  // Fetch books
  React.useEffect(() => {
    api
      .get("/Book/approved")
      .then((res) => setBooks(res.data))
      .catch(() => setBooks([]));
  }, []);

  // Fetch chapters for selected book
  React.useEffect(() => {
    if (!selectedBook) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }
    api
      .get(`/Chapter/book/${selectedBook}`)
      .then((res) => setChapters(res.data))
      .catch(() => setChapters([]));
  }, [selectedBook]);

  // Fetch lessons for selected chapter
  React.useEffect(() => {
    if (!selectedChapter) {
      setLessons([]);
      setSelectedLesson("");
      return;
    }
    api
      .get(`/Lesson/chapter/${selectedChapter}`)
      .then((res) => setLessons(res.data))
      .catch(() => setLessons([]));
  }, [selectedChapter]);

  // Fetch biologies for selected lesson
  React.useEffect(() => {
    if (!selectedLesson) {
      setBiologies([]);
      return;
    }
    api
      .get(`/Biologies/lesson/${selectedLesson}`)
      .then((res) => setBiologies(res.data))
      .catch(() => setBiologies([]));
  }, [selectedLesson]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Show full info dialog
  const handleLearnMore = (bio) => {
    setDetailBio(bio);
    setDetailOpen(true);
  };
  const handleDetailClose = () => setDetailOpen(false);

  // Edit handler (implement as needed)
  const handleEdit = (bio) => {
    // Open your edit dialog or navigate to edit page
    setSnackbar({
      open: true,
      message: `Edit biology: ${bio.commonName}`,
      severity: "info",
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Biology Management
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="book-select-label">Choose Book</InputLabel>
          <Select
            labelId="book-select-label"
            value={selectedBook}
            label="Choose Book"
            onChange={(e) => {
              setSelectedBook(e.target.value);
              setSelectedChapter("");
              setSelectedLesson("");
            }}
          >
            {books.map((book) => (
              <MenuItem key={book.book_Id} value={book.book_Id}>
                {book.book_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="chapter-select-label">Choose Chapter</InputLabel>
          <Select
            labelId="chapter-select-label"
            value={selectedChapter}
            label="Choose Chapter"
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setSelectedLesson("");
            }}
            disabled={!selectedBook}
          >
            {chapters.map((chapter) => (
              <MenuItem key={chapter.chapter_Id} value={chapter.chapter_Id}>
                {chapter.chapter_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300, mr: 2 }}>
          <InputLabel id="lesson-select-label">Choose Lesson</InputLabel>
          <Select
            labelId="lesson-select-label"
            value={selectedLesson}
            label="Choose Lesson"
            onChange={(e) => setSelectedLesson(e.target.value)}
            disabled={!selectedChapter}
          >
            {lessons.map((lesson) => (
              <MenuItem key={lesson.lesson_Id} value={lesson.lesson_Id}>
                {lesson.lesson_Title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "flex-start",
        }}
      >
        {biologies.map((bio) => (
          <Card key={bio.id} sx={{ width: 345 }}>
            <CardMedia
              component="img"
              height="180"
              image={bio.imageUrl}
              alt={bio.commonName}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {bio.commonName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minHeight: 48 }}
              >
                {bio.description.length > 90
                  ? bio.description.slice(0, 90) + "..."
                  : bio.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEdit(bio)}
              >
                Edit
              </Button>
              <Button size="small" onClick={() => handleLearnMore(bio)}>
                Learn More
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleDetailClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {detailBio?.commonName} ({detailBio?.scientificName})
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Type:</b> {detailBio?.specieType}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Description:</b> {detailBio?.description}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Habitat:</b> {detailBio?.habitat}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Discovered At:</b> {detailBio?.discoveredAt}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Average Life Span:</b> {detailBio?.averageLifeSpan}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Status:</b> {detailBio?.status}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <b>Extinct:</b> {detailBio?.isExtinct ? "Yes" : "No"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
