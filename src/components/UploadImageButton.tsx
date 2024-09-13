import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  CardMedia,
} from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import { useState } from "react";

interface UploadImageProps {
  onImageSelect: (image: File) => void;
}

const UploadImageButton: React.FC<UploadImageProps> = ({onImageSelect}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
      onImageSelect(event.target.files[0]);
    }
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid', borderRadius: '8px' }}>
      <Typography paddingBottom={2} id="modal-modal-title" variant="h6" component="h2">
        Bild hochladen
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadOutlined />}
          sx={{ width: "100%" }}
        >
          Datei auswählen
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>
        {image && (
          <Typography variant="body2" color="textSecondary">
            Ausgewählte Datei: {image.name}
          </Typography>
        )}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!image || uploading}
          sx={{ width: "100%" }}
        >
          Hochladen
        </Button> */}
      </Box>
      {imageURL && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hochgeladenes Bild
              </Typography>
              <CardMedia
                component="img"
                height="300"
                image={imageURL}
                alt="Uploaded Image"
                sx={{ objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        </Grid>
      )}
    </Box>
  );
}

export default UploadImageButton;
