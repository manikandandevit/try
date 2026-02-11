const ViewSettings = ({ data }) => {
  return (
    <div className="space-y-8">

      <h2 className="text-2xl font-semibold">Company Details</h2>

      <div className="grid grid-cols-2 gap-6 text-sm">

        {Object.entries(data).map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <p className="text-gray-500 capitalize">{key}</p>
                <p className="font-medium">{value.join(", ")}</p>
              </div>
            );
          }

          if (key.includes("Logo") || key.includes("Image")) {
            return (
              <div key={key}>
                <p className="text-gray-500 capitalize">{key}</p>
                {value ? (
                  <img src={value} alt="" className="h-16 mt-2" />
                ) : (
                  <p className="text-gray-400">No Image</p>
                )}
              </div>
            );
          }

          return (
            <div key={key}>
              <p className="text-gray-500 capitalize">{key}</p>
              <p className="font-medium">{value}</p>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default ViewSettings;
