import { Timestamp } from "firebase/firestore";

export function formatDate (date: Date | Timestamp | undefined): string {
    if(!date) return "?";
    if( date instanceof Date) {
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } else if (date instanceof Timestamp) {
        return date.toDate().toDateString();
        }
    else  if (date as {seconds: number, nanoseconds: number}) {
        let convertedDate: {seconds: number, nanoseconds: number} = date;
        let result = (new Date(convertedDate.seconds * 1000 + convertedDate.nanoseconds / 1000000)).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if(!result) {
            result = date as string;
        }
        return result;
     } else return "?";
};