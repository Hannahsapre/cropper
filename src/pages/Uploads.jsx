import { useEffect, useState } from "react";
import "cropperjs/dist/cropper.css";
import axios from "axios";

const Upload = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [startX, setStartX] = useState("");
  const [startY, setStartY] = useState("");
  const [endX, setEndX] = useState("");
  const [endY, setEndY] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://x22201785-env.eba-dzzw5zpu.us-east-1.elasticbeanstalk.com/captcha/random"
        );
        setCaptcha(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const newCaptcha = async () => {
    try {
      const response = await axios.get(
        "http://x22201785-env.eba-dzzw5zpu.us-east-1.elasticbeanstalk.com/captcha/random"
      );
      setCaptcha(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleStartXChange = (e) => {
    setStartX(e.target.value);
  };

  const handleStartYChange = (e) => {
    setStartY(e.target.value);
  };

  const handleEndXChange = (e) => {
    setEndX(e.target.value);
  };

  const handleEndYChange = (e) => {
    setEndY(e.target.value);
  };

  const handleSourceImageChange = (event) => {
    const file = event.target.files[0];
    setSourceImage(file);
  };

  const handleWatermarkImageChange = (event) => {
    const file = event.target.files[0];
    setWatermarkImage(file);
  };

  const addWatermark = (imageFile, watermarkFile) => {
    let formData = new FormData();
    formData.append("image", imageFile);
    formData.append("watermark", watermarkFile);
    formData.append("position", "center");
    formData.append("opacity", 0.5);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://3.93.115.39:5001/add_watermark",
      data: formData,
      responseType: "arraybuffer",
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const imageDataUrl = `data:image/jpeg;base64,${base64}`;
        setWatermarkedImage(imageDataUrl);
      })
      .catch((error) => {
        console.error("Error adding watermark:", error);
      });
  };

  const handleWatermark = () => {
    addWatermark(sourceImage, watermarkImage);
  };

  const handleVerify = () => {
    if (captcha.key_content !== answer) {
      alert("Invalid Captcha");
    } else {
      alert("You are not a robot!");
    }
  };

  const handleCDownload = () => {
    if (compressedImage) {
      const link = document.createElement("a");
      link.href = compressedImage;
      link.download = "compressed_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleWDownload = () => {
    if (watermarkedImage) {
      const link = document.createElement("a");
      link.href = watermarkedImage;
      link.download = "watermarked_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCrop = () => {
    let data = new FormData();
    data.append("image", sourceImage);

    data.append(
      "cropping_dimensions",
      `[[${startX},${startY}],[${endX},${endY}]]`
    );

    data.append("compression_level", compressionQuality * 100);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://cropper.us-east-1.elasticbeanstalk.com/api/image/crop-n-compress/",
      data: data,
      responseType: "arraybuffer",
    };

    axios
      .request(config)
      .then((response) => {
        console.log(response.data);
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const imageDataUrl = `data:image/jpeg;base64,${base64}`;
        setCompressedImage(imageDataUrl);
        // const blob = new Blob([response.data], { type: "image/jpeg" });
        // const blobUrl = URL.createObjectURL(blob);
        // setCompressedImage(blobUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Image Processor</h1>

      <div className="mb-4">
        <label htmlFor="sourceImageInput" className="block mb-2">
          Select Source Image:
        </label>
        <input
          type="file"
          id="sourceImageInput"
          onChange={handleSourceImageChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="watermarkImageInput" className="block mb-2">
          Select Watermark Image:
        </label>
        <input
          type="file"
          id="watermarkImageInput"
          onChange={handleWatermarkImageChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startX">Start X:</label>
            <input
              type="text"
              id="startX"
              value={startX}
              onChange={handleStartXChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="startY">Start Y:</label>
            <input
              type="text"
              id="startY"
              value={startY}
              onChange={handleStartYChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="endX">End X:</label>
            <input
              type="text"
              id="endX"
              value={endX}
              onChange={handleEndXChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="endY">End Y:</label>
            <input
              type="text"
              id="endY"
              value={endY}
              onChange={handleEndYChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="compressionInput" className="block mb-2">
          Compression Quality:
        </label>
        <input
          type="range"
          id="compressionInput"
          min="0"
          max="1"
          step="0.01"
          value={compressionQuality}
          onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 w-full"
        />
        <p className="text-sm">Compression Quality: {compressionQuality}</p>
      </div>
      {captcha && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2 text-center">
            Solve the Captcha:
          </h2>
          <img src={captcha.image_url} alt="Captcha" className="mx-auto my-2" />
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            placeholder="Enter Captcha Answer"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
          <span
            className="text-sm text-blue-400 cursor-pointer inline-block mt-2"
            onClick={() => newCaptcha()}
          >
            Reload Captcha
          </span>
        </div>
      )}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleVerify}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Verify Captcha
        </button>
        <button
          onClick={handleCrop}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Crop and Compress Image
        </button>
        <button
          onClick={handleWatermark}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Watermark
        </button>
      </div>
      {compressedImage && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2 text-center">
            Cropped and Compressed Image:
          </h2>
          <div className=" justify-between">
            <img src={compressedImage} />
            <button
              className="bg-green-500 flex justify-center items-center w-full mt-2 h-10 text-white px-2 py-2 rounded-md hover:bg-green-600"
              onClick={handleCDownload}
            >
              Download Image
            </button>
          </div>
        </div>
      )}
      {watermarkedImage && (
        <div className="mt-4">
          {/* {console.log(watermarkedImage)} */}
          <h2 className="text-xl font-bold mb-2 text-center">
            Watermarked Image:
          </h2>
          <div className="justify-between">
            <img src={watermarkedImage} />
            <button
              className="bg-green-500 h-10 text-white px-2 w-full mt-2 py-2 rounded-md hover:bg-green-600"
              onClick={handleWDownload}
            >
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;