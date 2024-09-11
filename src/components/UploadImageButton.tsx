import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";

function UploadImageButton() {

	const [image, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setImage(event.target.files[0])
		}
	}

	const handleUpload = () => {
		if (image) {
			const storage = getStorage();
			const storageRef = ref(storage, 'images/${image.name}');
			const uploadTask = uploadBytesResumable(storageRef, image);

			setUploading(true);

			uploadTask.on(
				'state_changed',
				(snapshot) => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					setProgress(progress);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						setImageURL(downloadURL);
						setUploading(false);
					});
				}
			);


		}
	}

}

export default UploadImageButton;