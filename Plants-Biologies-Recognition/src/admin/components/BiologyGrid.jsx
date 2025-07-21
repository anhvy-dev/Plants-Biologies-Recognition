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
import DeleteIcon from "@mui/icons-material/Delete";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Chip from "@mui/material/Chip";
import DialogContentText from "@mui/material/DialogContentText";
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
  const [editOpen, setEditOpen] = React.useState(false);
  const [editBio, setEditBio] = React.useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusBio, setStatusBio] = React.useState(null);
  const [statusValue, setStatusValue] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");

  // Add state for image popup
  const [imgOpen, setImgOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState("");

  // State for create dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createValues, setCreateValues] = React.useState({
    commonName: "",
    scientificName: "",
    specieType: "",
    description: "",
    habitat: "",
    imageUrl: "",
    discoveredAt: "",
    averageLifeSpan: "",
    isExtinct: false,
  });

  // Fetch books
  React.useEffect(() => {
    api
      .get("/Book/search")
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

  // Open edit dialog
  const handleEdit = (bio) => {
    setEditBio(bio);
    setEditOpen(true);
  };

  // Handler for image click
  const handleImgClick = (src) => {
    setImgSrc(src);
    setImgOpen(true);
  };

  // Handle edit form submit
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const updatedBio = {
      commonName: form.commonName.value,
      scientificName: form.scientificName.value,
      specieType: form.specieType.value,
      description: form.description.value,
      habitat: form.habitat.value,
      imageUrl: form.imageUrl.value,
      isExtinct: form.isExtinct.checked,
      discoveredAt: form.discoveredAt.value,
      averageLifeSpan: form.averageLifeSpan.value,
      isActive: true,
      status: editBio.status, // Use existing status
      rejectionReason: editBio.rejectionReason || "", // Use existing rejection reason
      lesson_Id: editBio.lesson_Id,
    };
    try {
      await api.put(`/Biologies/${editBio.id}`, updatedBio);
      setSnackbar({
        open: true,
        message: "Biology updated successfully!",
        severity: "success",
      });
      setEditOpen(false);
      // Refresh biologies
      api
        .get(`/Biologies/lesson/${selectedLesson}`)
        .then((res) => setBiologies(res.data))
        .catch(() => setBiologies([]));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Update failed.",
        severity: "error",
      });
    }
  };

  // Open status dialog
  const handleStatusClick = (bio) => {
    setStatusBio(bio);
    setStatusValue(bio.status);
    setStatusReason(bio.rejectionReason || "");
    setStatusDialogOpen(true);
  };

  // Save status change
  const handleStatusSave = async () => {
    if (statusValue === "Rejected" && !statusReason) {
      setSnackbar({
        open: true,
        message: "Rejection reason is required when status is Rejected.",
        severity: "error",
      });
      return;
    }
    try {
      await api.put(`/Biologies/${statusBio.id}/status`, {
        status: statusValue,
        rejectionReason: statusValue === "Rejected" ? statusReason : "",
      });
      setSnackbar({
        open: true,
        message: "Status updated successfully.",
        severity: "success",
      });
      setStatusDialogOpen(false);
      // Refresh biologies
      api
        .get(`/Biologies/lesson/${selectedLesson}`)
        .then((res) => setBiologies(res.data))
        .catch(() => setBiologies([]));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update status.",
        severity: "error",
      });
    }
  };

  // Handle create form open
  const handleCreateOpen = () => {
    setCreateValues({
      commonName: "",
      scientificName: "",
      specieType: "",
      description: "",
      habitat: "",
      imageUrl: "",
      discoveredAt: "",
      averageLifeSpan: "",
      isExtinct: false,
    });
    setCreateOpen(true);
  };

  // Handle create form close
  const handleCreateClose = () => {
    setCreateOpen(false);
  };

  // Handle create form field change
  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle create form submit
  const handleCreateSubmit = async () => {
    if (
      !createValues.commonName.trim() ||
      !createValues.scientificName.trim() ||
      !createValues.specieType.trim() ||
      !createValues.description.trim() ||
      !createValues.habitat.trim() ||
      !createValues.imageUrl.trim() ||
      !createValues.discoveredAt.trim() ||
      !createValues.averageLifeSpan.trim() ||
      !selectedLesson
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields and select a lesson.",
        severity: "error",
      });
      return;
    }
    try {
      await api.post("/Biologies", {
        ...createValues,
        lesson_Id: selectedLesson,
        status: "Pending",
        rejectionReason: "",
        isActive: true,
      });
      setSnackbar({
        open: true,
        message: "Biology created successfully.",
        severity: "success",
      });
      setCreateOpen(false);
      // Refresh biologies
      api
        .get(`/Biologies/lesson/${selectedLesson}`)
        .then((res) => setBiologies(res.data))
        .catch(() => setBiologies([]));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to create biology.",
        severity: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async (bioId) => {
    try {
      await api.delete(`/Biologies/${bioId}`);
      setSnackbar({
        open: true,
        message: "Biology deleted successfully.",
        severity: "success",
      });
      // Refresh biologies
      api
        .get(`/Biologies/lesson/${selectedLesson}`)
        .then((res) => setBiologies(res.data))
        .catch(() => setBiologies([]));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete biology.",
        severity: "error",
      });
    }
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
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          disabled={!selectedLesson}
        >
          Create
        </Button>
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
              sx={{ cursor: "pointer" }}
              onClick={() => handleImgClick(bio.imageUrl)}
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
              <Chip
                label={bio.status}
                color={
                  bio.status === "Approved"
                    ? "success"
                    : bio.status === "Rejected"
                    ? "error"
                    : "default"
                }
                size="small"
                variant="outlined"
                onClick={() => handleStatusClick(bio)}
                sx={{ cursor: "pointer", mr: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleEdit(bio)}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(bio.id)}
              >
                Delete
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
      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Biology</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                name="commonName"
                label="Common Name"
                defaultValue={editBio?.commonName}
                required
              />
              <TextField
                name="scientificName"
                label="Scientific Name"
                defaultValue={editBio?.scientificName}
                required
              />
              <TextField
                name="specieType"
                label="Specie Type"
                defaultValue={editBio?.specieType}
                required
              />
              <TextareaAutosize
                name="description"
                label="Description"
                minRows={2}
                maxRows={20}
                style={{
                  width: "100%",
                  fontSize: "1rem",
                  padding: "8.5px 14px",
                  borderRadius: 4,
                  borderColor: "#c4c4c4",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                defaultValue={editBio?.description || ""}
                placeholder="Description"
                required
              />
              <TextField
                name="habitat"
                label="Habitat"
                defaultValue={editBio?.habitat}
                required
              />
              <TextField
                name="imageUrl"
                label="Image URL"
                defaultValue={editBio?.imageUrl}
                required
              />
              <TextField
                name="discoveredAt"
                label="Discovered At"
                defaultValue={editBio?.discoveredAt}
                required
              />
              <TextField
                name="averageLifeSpan"
                label="Average Life Span"
                defaultValue={editBio?.averageLifeSpan}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isExtinct"
                    defaultChecked={editBio?.isExtinct}
                  />
                }
                label="Extinct"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Status"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          {statusValue === "Rejected" && (
            <TextField
              label="Rejection Reason"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{ mt: 2 }}
              error={!statusReason}
              helperText={!statusReason ? "Rejection reason is required." : ""}
            />
          )}
          <DialogContentText sx={{ mt: 1 }}>
            Changing status will update the biology's approval state.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Image Preview Dialog */}
      <Dialog
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
          <img
            src={imgSrc}
            alt="Biology"
            style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImgOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Biology</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="commonName"
              label="Common Name"
              value={createValues.commonName}
              onChange={handleCreateChange}
              required
            />
            <TextField
              name="scientificName"
              label="Scientific Name"
              value={createValues.scientificName}
              onChange={handleCreateChange}
              required
            />
            <TextField
              name="specieType"
              label="Specie Type"
              value={createValues.specieType}
              onChange={handleCreateChange}
              required
            />
            <TextareaAutosize
              name="description"
              minRows={2}
              maxRows={20}
              style={{
                width: "100%",
                fontSize: "1rem",
                padding: "8.5px 14px",
                borderRadius: 4,
                borderColor: "#c4c4c4",
                resize: "vertical",
                boxSizing: "border-box",
              }}
              value={createValues.description}
              onChange={handleCreateChange}
              placeholder="Description"
              required
            />
            <TextField
              name="habitat"
              label="Habitat"
              value={createValues.habitat}
              onChange={handleCreateChange}
              required
            />
            <TextField
              name="imageUrl"
              label="Image URL"
              value={createValues.imageUrl}
              onChange={handleCreateChange}
              required
            />
            <TextField
              name="discoveredAt"
              label="Discovered At"
              value={createValues.discoveredAt}
              onChange={handleCreateChange}
              required
            />
            <TextField
              name="averageLifeSpan"
              label="Average Life Span"
              value={createValues.averageLifeSpan}
              onChange={handleCreateChange}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="isExtinct"
                  checked={createValues.isExtinct}
                  onChange={handleCreateChange}
                />
              }
              label="Extinct"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create
          </Button>
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
