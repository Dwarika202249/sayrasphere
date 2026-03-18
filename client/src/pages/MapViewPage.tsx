import React, { useEffect } from 'react';
import { useAppDispatch } from '../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { fetchDevices } from '../features/devices/devicesSlice';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import type { Device } from '../features/devices/devicesSlice';

const MapViewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: devices } = useSelector((state: RootState) => state.devices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Filter devices that have location data
  const locatedDevices = devices.filter(
    (d) => d.location && d.location.lat && d.location.lng
  );

  // Default center
  const defaultLat = locatedDevices.length > 0 ? locatedDevices[0].location!.lat : 28.6139;
  const defaultLng = locatedDevices.length > 0 ? locatedDevices[0].location!.lng : 77.2090;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-indigo-500" />
          <span>Facility Map</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Geo-locate your connected devices across your facility.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {locatedDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6">
            <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No devices have location data assigned yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Add <code>location: {`{ lat, lng }`}</code> to your device records in MongoDB to see them on the map.
            </p>
          </div>
        ) : (
          <div className="h-125 md:h-150 w-full">
            <Map
              initialViewState={{
                latitude: defaultLat,
                longitude: defaultLng,
                zoom: 13,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            >
              <NavigationControl position="top-right" />

              {locatedDevices.map((device) => (
                <Marker
                  key={device._id}
                  latitude={device.location!.lat}
                  longitude={device.location!.lng}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedDevice(device);
                  }}
                >
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer ${device.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </Marker>
              ))}

              {selectedDevice && selectedDevice.location && (
                <Popup
                  latitude={selectedDevice.location.lat}
                  longitude={selectedDevice.location.lng}
                  onClose={() => setSelectedDevice(null)}
                  closeOnClick={false}
                  anchor="top"
                >
                  <div className="text-sm p-1">
                    <p className="font-bold text-gray-900">{selectedDevice.name}</p>
                    <p className="text-gray-500 capitalize">{selectedDevice.type}</p>
                    <p className={`font-medium mt-1 ${selectedDevice.status === 'online' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {selectedDevice.status === 'online' ? '● Online' : '● Offline'}
                    </p>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapViewPage;
