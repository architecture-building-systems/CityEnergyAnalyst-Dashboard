import { Tooltip } from 'antd';

import { useEffect, useState } from 'react';
import { useMapStore } from '../../../Map/store/store';
import { SolarRadiationIcon } from '../../../../assets/icons';
import { useSelector } from 'react-redux';
import { useGetMapLayerCategories } from '../../../Map/Layers';

const MapLayers = () => {
  const [active, setActive] = useState(null);
  const setSelectedMapCategory = useMapStore(
    (state) => state.setSelectedMapCategory,
  );

  const scenarioName = useSelector((state) => state.project.info.scenario_name);

  const mapLayers = useGetMapLayerCategories();

  const toggleActive = (category) => {
    setActive(active == category ? null : category);
  };

  // Reset active layer when scenario changes
  useEffect(() => {
    setActive(null);
  }, [scenarioName]);

  useEffect(() => {
    if (active == null) {
      setSelectedMapCategory(null);
    } else {
      const layers = mapLayers?.categories?.find((l) => l.name == active);
      setSelectedMapCategory(layers);
    }
  }, [active]);

  if (!scenarioName) return null;

  return (
    <div
      className="cea-overlay-card"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

        boxSizing: 'border-box',
        height: '100%',

        display: 'flex',
        alignItems: 'center',

        fontSize: 12,
      }}
    >
      {mapLayers?.categories?.map((category) => {
        const { name } = category;
        return (
          <CategoryIconButton
            key={name}
            onClick={toggleActive}
            category={name}
            active={active == name}
          />
        );
      })}
    </div>
  );
};

const CategoryIconButton = ({ category, onClick, active }) => {
  // FIXME: This is hardcoded for now
  const _icon = SolarRadiationIcon;
  const style = active
    ? {
        color: 'white',
        backgroundColor: '#333',
      }
    : {
        color: 'black',
      };

  const handleClick = () => {
    onClick?.(category);
  };

  return (
    <Tooltip title={category} overlayInnerStyle={{ fontSize: 12 }}>
      <_icon
        className="cea-card-toolbar-icon"
        style={style}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default MapLayers;
