import Skeleton from "react-loading-skeleton";

const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-[#1e293b] p-5 rounded-xl">
          <Skeleton height={20} width={100} />
          <Skeleton height={30} width={80} style={{ marginTop: 10 }} />
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;