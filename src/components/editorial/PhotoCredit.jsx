const PhotoCredit = ({ name, url, note = "" }) => {
    if (!name && !note) return null;

    return (
        <span className="photo-credit">
            {note && <span>{note}</span>}
            {name && url && (
                <a href={url} target="_blank" rel="noreferrer">
                    Photo by {name}
                </a>
            )}
            {name && !url && <span>Photo by {name}</span>}
        </span>
    );
};

export default PhotoCredit;