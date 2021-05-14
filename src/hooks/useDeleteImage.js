import { useEffect } from 'react';
import { db, storage } from '../firebase';

const useDeleteImage = (image) => {
	useEffect(() => {
		if (!image) {
			return;
		}

		(async () => {
			
			db.collection('images').doc(image.id).delete()
			db.collection('images')
			.where('path', '==', image.path)
			.where('owner', '==', image.owner)
			.get().then(docs => {
				const imgs = []
				docs.forEach(doc => {
					imgs.push({
						id: doc.id,
						...doc.data()
						
					})
				})
				if (imgs.length === 1) {
					storage.ref(image.path).delete()
				}
			})
			
		})();
	}, [image]);

	return {}
}

export default useDeleteImage

