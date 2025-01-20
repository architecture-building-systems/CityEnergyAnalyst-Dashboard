import { Tooltip } from 'antd';
import { useMapStore } from './store/store';
import { CameraView, Compass, ExtrudeIcon } from '../../assets/icons';
import { useInputs } from '../../hooks/queries/useInputs';

const buttonStyle = {
  fontSize: 24,
  padding: 8,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const ExtrudeButton = () => {
  const extruded = useMapStore((state) => state.extruded);
  const setExtruded = useMapStore((state) => state.setExtruded);

  const toggleExtruded = () => {
    setExtruded(!extruded);
  };

  return (
    <Tooltip title="Toggle 3D" overlayInnerStyle={{ fontSize: 12 }}>
      <ExtrudeIcon style={buttonStyle} onClick={toggleExtruded} />
    </Tooltip>
  );
};

const ResetCameraButton = () => {
  const setViewState = useMapStore((state) => state.setViewState);
  const cameraOptions = useMapStore((state) => state.cameraOptions);

  const resetCamera = () => {
    setViewState((state) => ({
      ...state,
      pitch: 0,
      zoom: cameraOptions.zoom,
      bearing: cameraOptions.bearing,
      latitude: cameraOptions.center.lat,
      longitude: cameraOptions.center.lng,
    }));
  };
  return (
    <Tooltip title="Reset Camera" overlayInnerStyle={{ fontSize: 12 }}>
      <CameraView style={buttonStyle} onClick={resetCamera} />
    </Tooltip>
  );
};

const ResetCompassButton = () => {
  const viewState = useMapStore((state) => state.viewState);
  const setViewState = useMapStore((state) => state.setViewState);

  const bearings = -(viewState?.bearing ?? 0);

  const resetCompass = () => {
    setViewState((state) => ({
      ...state,
      bearing: 0,
    }));
  };

  return (
    <Tooltip title="Reset Compass" overlayInnerStyle={{ fontSize: 12 }}>
      <Compass
        style={{
          ...buttonStyle,
          transform: `rotate(${bearings}deg)`,
        }}
        onClick={resetCompass}
      />
    </Tooltip>
  );
};

const MapControls = () => {
  const { data: inputData } = useInputs();
  const { geojsons: data } = inputData;

  return (
    <div id="map-controls">
      {data?.zone && (
        <>
          <ExtrudeButton />
          <ResetCameraButton />
        </>
      )}
      <ResetCompassButton />
    </div>
  );
};

export default MapControls;
