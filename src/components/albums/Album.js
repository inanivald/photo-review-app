import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import ImagesView from './ImagesView'
import { Button, Alert } from 'react-bootstrap'
import useAlbum from '../../hooks/useAlbum'
import UploadAlbumImage from './UploadAlbumImage'
import EditAlbumTitle from './EditAlbumTitle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'
import { db, storage } from '../../firebase'

const Album = () => {
	const [reviewLink, setReviewLink] = useState(null)
	const { albumId } = useParams()
	const { album, images, loading } = useAlbum(albumId)
	const [editTitle, setEditTitle] = useState(false)
	const { currentUser } = useAuth()
	const [selectedImages, setSelectedImages] = useState([]);
	const [error, setError] = useState(false);
	const [btnDisabled, setBtnDisabled] = useState(false);
    const navigate = useNavigate();

	const handleEditTitle = () => {
        setEditTitle(true);
	};

	const handleCreateReviewLink = (album) => {
        let urlOrigin = window.location.origin
        let url = `${urlOrigin}/review/${album}`;
        setReviewLink(url);
    }
    
    const updateSelectedImages = (e) => {
        const [image] = images.filter(image => (image.id === e.target.id));

        if(e.target.checked === true) {
            setSelectedImages(images => [...images, image]);
        } else {
            const updatedImageArray = selectedImages.filter(image => (image.id !== e.target.id))
            setSelectedImages(updatedImageArray);
        }
    };

	const handleCreateNewAlbum = async () => {
        const title = prompt('New album title:');
        
        if (title.length < 4) {
            setError('Title must be at least 3 chars.')
            return; 
        };

        setError(false);
        setBtnDisabled(true);

        try {
            const docRef = await db.collection('albums').add({
                title,
                owner: currentUser.uid
            });

            await selectedImages.forEach(selectedImage => {
                const image = {
                    name: selectedImage.name,
                    path: selectedImage.name,
                    size: selectedImage.size,
                    type: selectedImage.type,
                    owner: currentUser.uid,
                    url: selectedImage.url,
                }
                if (albumId) {
                    image.album = db.collection('albums').doc(docRef.id)
                }
                db.collection('images').add(image);
                storage.ref(`images/selected/${image.name}`).put(image);
            });
            navigate(`/albums`);
        } catch (err) {
            setError(err.message);
            setBtnDisabled(false);
        };
    };
	
	return (
		<>	
        <div className="text-center">
			{loading
				? (<ClipLoader/>)
				: album && 
					<>
						{editTitle 
							? <EditAlbumTitle album={album}/> 
							: <>
								<h2> {album.title} 
								<span 
									className="edit_album_title" 
									onClick={handleEditTitle}>
									<FontAwesomeIcon icon={faPen} size="xs"/>
								</span>
								</h2>

					<div className="text-center mt-3 mb-3">
						<div>
							<Button className="btn btn-standard" onClick={() => {handleCreateReviewLink(albumId)}}>Create review link</Button>
						</div>
					</div>

					{
                		reviewLink && (
                    		<p>Review link: <a href={reviewLink}>{reviewLink}</a></p>
                		)
        			}
				
					<UploadAlbumImage albumId={albumId} />
					<ImagesView images={images} updateSelectedImages={updateSelectedImages} />
					{
                    selectedImages.length > 0 && (
                        <div className="text-center mt-3">
                            <p className="selected-photos">Selected photos: {selectedImages.length}</p>
                            <div className="d-flex justify-content-center">
								<Button
                                    disabled={btnDisabled} 
                                    className="btn btn-standard" 
                                    onClick={handleCreateNewAlbum}>
                                        Create new album
                                </Button>
							         
                            </div>
                        </div>
                    )
                }
							<div>
								{
                    error && (
                        <Alert variant="danger" className="text-center mt-3">{error}</Alert>
                    )
                }
                     </div>  
					
								</>
							}
						</>
				}
            </div>
		</>
	)
}


export default Album