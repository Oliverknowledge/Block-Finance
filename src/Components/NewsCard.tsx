interface NewsCardProps {
  title: string;
  description: string | null;
  link: string;
  imageUrl: string | null;
  pubDate: string;
  source: string;
}

const NewsCard = ({ title, description, link, imageUrl, pubDate, source }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    //Difference in hours
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    //Use if statements to determine how recent a post is for the user - improving user experience
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="
      block rounded-xl border border-slate-200
      text-black dark:text-white
      no-underline
      overflow-hidden
      hover:shadow-md
      
      transition-shadow duration-200
      group
    "
  >

   
       <div className="w-full h-40 overflow-hidden ">
       <img
       //If image url isn't present then use the backup image
         src={imageUrl || "/backup.webp"}
         alt={title}
         //Typical tailwindcss animation for image upscale on hover
         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
       />
     </div>
     
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium  uppercase">
            {source}
          </span>
          <span className="text-xs ">
            {formatDate(pubDate)}
          </span>
        </div>        <h3 className="text-sm font-semibold  mb-2 line-clamp-2 ">
          {title}
        </h3>
        {/*If description then showcase it */}
        {description && (
          <p className="text-xs  line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </a>
  );
};

export default NewsCard;
