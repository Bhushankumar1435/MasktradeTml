import Skeleton from "react-loading-skeleton";

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="p-3">
              <Skeleton
                height={25}
                baseColor="#1e293b"
                highlightColor="#334155"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;