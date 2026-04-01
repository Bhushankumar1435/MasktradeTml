import Skeleton from "react-loading-skeleton";

const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-[#1e293b] p-4 rounded-lg">
          <Skeleton height={15} width={150} />
          <Skeleton height={15} width={200} style={{ marginTop: 6 }} />
          <Skeleton height={15} width={120} style={{ marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;