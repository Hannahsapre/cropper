import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {
  Box,
  Button,
  Card,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { useNavigate } from "react-router-dom";
const Upload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [coordinates, setCoordinates] = useState({
    width: 300,
    height: 300,
    left: 50,
    top: 50,
  });
  const [cropping, setCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [captcha, setCaptcha] = useState(null);

  const cropImage = async () => {
    try {
      setCropping(true);
      const response = await fetch(uploadedFile);
      const blob = await response.blob();
      var file = new File([blob], "filename_here");
      var cropImageFormData = new FormData();
      cropImageFormData.append("image", file);
      cropImageFormData.append(
        "cropping_dimensions",
        `[[${coordinates?.left},${coordinates?.top}],[${
          coordinates?.width + coordinates?.left
        },${coordinates?.height + coordinates?.top}]]`
      );

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://cropper.us-east-1.elasticbeanstalk.com/api/image/crop/",
        data: cropImageFormData,
        responseType: "arraybuffer",
      };

      const cropResponse = await axios.request(config);

      const croppedFile = new File([cropResponse.data], "filename.jpg", {
        type: "application/octet-stream",
      });

      //! watermark /////////////////////////////////////////
      if (watermark) {
        const watermarkFileResponse = await fetch(watermark);
        const watermarkBlob = await watermarkFileResponse.blob();
        var watermarkFile = new File([watermarkBlob], "filename_here");

        const watermarkFormdata = new FormData();
        watermarkFormdata.append("image", croppedFile);
        watermarkFormdata.append("watermark", watermarkFile);
        watermarkFormdata.append("position", "center");
        watermarkFormdata.append("opacity", 0.5);

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "http://3.93.115.39:5001/add_watermark",
          data: watermarkFormdata,
          responseType: "arraybuffer",
        };

        const outputResponse = await axios.request(config);
        const outputFile = new File([outputResponse.data], "filename.jpg", {
          type: "image/jpg",
        });

        setCroppedImage(URL.createObjectURL(outputFile));
      } else {
        setCroppedImage(URL.createObjectURL(croppedFile));
      }
      setCropping(false);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const debouncedCropImage = debounce(cropImage, 500);

  const onChange = (cropper) => {
    setCoordinates(cropper.getCoordinates());
  };

  useEffect(() => {
    if (uploadedFile) {
      debouncedCropImage.cancel();
      debouncedCropImage();
    }
  }, [coordinates, watermark]);

  useEffect(() => {
    (async () => {
      try {
        const captchaResponse = await axios({
          url: "http://x22201785-env.eba-dzzw5zpu.us-east-1.elasticbeanstalk.com/captcha/random/",
        });

        setCaptcha(captchaResponse.data);
      } catch (error) {
        console.log("🚀 ~ error:", error);
      }
    })();
  }, []);

  const navigate = useNavigate();
  const uploadImage = async () => {
    try {
      if (captcha?.key_content !== captcha?.value) {
        alert("Invalid Captcha!");
        return;
      }
      const outputImageResponse = await axios({
        url: croppedImage,
        responseType: "blob",
      });
      console.log(
        "🚀 ~ uploadImage ~ outputImageResponse:",
        outputImageResponse
      );
      var outputFile = new File([outputImageResponse.data], "PixelScale.jpg", {
        type: "image/jpg",
      });
      const uploadImageFormdata = new FormData();
      uploadImageFormdata.append("file", outputFile);
      const { data: uploadedImageData } = await axios({
        url: "http://inventory-managment.ap-south-1.elasticbeanstalk.com/api/s3",
        data: uploadImageFormdata,
        method: "post",
      });

      await axios({
        url: "https://cp10xoec24.execute-api.eu-west-1.amazonaws.com/default/zeba_lambda",
        method: "post",
        data: JSON.stringify(uploadedImageData),
      });

      navigate("/");
    } catch (error) {
      console.log("🚀 ~ uploadImage ~ error:", error);
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={3}>
          <Typography
            gutterBottom
            mt={1}
            align="center"
            fontWeight="bolder"
            variant="h5"
            component="div"
          >
            Input
          </Typography>
          <Card>
            <img
              id="preview_img"
              className="object-contain rounded"
              src={uploadedFile}
              style={{
                height: "350px",
                width: "100%",
                objectFit: "contain",
                background: "#ccc",
              }}
            />
          </Card>
          <Box textAlign="center" mt={2}>
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              onChange={(event) =>
                setUploadedFile(URL.createObjectURL(event.target.files[0]))
              }
              accept="image/jpg,image/jpeg"
            />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Typography
            gutterBottom
            mt={1}
            align="center"
            fontWeight="bolder"
            variant="h5"
            component="div"
          >
            Crop
          </Typography>
          <Card sx={{ height: 350 }}>
            <Cropper
              src={uploadedFile}
              onChange={onChange}
              className={"cropper"}
            />
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Typography
            gutterBottom
            mt={1}
            align="center"
            fontWeight="bolder"
            variant="h5"
            component="div"
          >
            Watermark
          </Typography>
          <Card>
            <img
              id="preview_img"
              className="object-contain rounded"
              src={watermark}
              style={{
                height: "350px",
                width: "100%",
                objectFit: "contain",
                background: "#ccc",
              }}
            />
          </Card>
          {croppedImage && (
            <Box textAlign="center" mt={2}>
              <span className="sr-only">Choose profile photo</span>
              <input
                disabled={!croppedImage}
                type="file"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                onChange={(event) =>
                  setWatermark(URL.createObjectURL(event.target.files[0]))
                }
                accept="image/png"
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={3}>
          <Typography
            gutterBottom
            mt={1}
            align="center"
            fontWeight="bolder"
            variant="h5"
            component="div"
          >
            Output
          </Typography>
          <Card>
            {cropping && <LinearProgress />}
            <img
              className="object-contain rounded"
              src={croppedImage}
              style={{
                height: "350px",
                width: "100%",
                objectFit: "contain",
                background: "#ccc",
              }}
            />
          </Card>
        </Grid>

        <Grid item xs={2}>
          <Card sx={{ px: 2, pb: 2 }} elevation={4}>
            <Typography
              gutterBottom
              mt={1}
              align="center"
              fontWeight="bolder"
              variant="h5"
              component="div"
            >
              Captcha
            </Typography>
            <img
              className="object-contain rounded border"
              src={captcha?.image_url}
              style={{
                width: "100%",
                objectFit: "contain",
                background: "#ccc",
              }}
            />

            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={captcha?.value}
              placeholder="Enter captcha code."
              onChange={(event) =>
                setCaptcha((prev) => ({ ...prev, value: event.target.value }))
              }
            />
          </Card>
        </Grid>

        <Grid item xs={2}>
          <Button
            sx={{ height: "100%" }}
            variant="contained"
            color="error"
            size="large"
            fullWidth
            disabled={!captcha?.value || !croppedImage}
            onClick={uploadImage}
          >
            <Typography fontWeight="bolder">
              <CloudUploadOutlinedIcon fontSize="large" />
              <br />
              Save to <br /> Gallery
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;
