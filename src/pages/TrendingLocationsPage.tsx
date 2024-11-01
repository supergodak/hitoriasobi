import React from 'react';
import { useTrendingLocations } from '../hooks/useTrendingLocations';
import LocationList from '../components/locations/LocationList';
import LocationTypeFilter from '../components/locations/LocationTypeFilter';
import { LocationType } from '../types/Location';

const TrendingLocationsPage: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState<LocationType>();
  const { locations, loading, error, hasMore, loadMore } = useTrendingLocations(selectedType);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <LocationTypeFilter
          selectedType={selectedType}
          onChange={setSelectedType}
        />
      </div>

      <LocationList
        locations={locations}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        showDistrict
      />
    </div>
  );
};

export default TrendingLocationsPage;