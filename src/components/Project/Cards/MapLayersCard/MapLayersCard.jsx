import { Tooltip } from 'antd';

import { useEffect, useState } from 'react';
import { useMapStore } from '../../../Map/store/store';
import {
  SolarRadiationIcon,
  GraphsIcon,
  NetworksIcon,
  DemandForecastingIcon,
} from '../../../../assets/icons';
import { useSelector } from 'react-redux';
import {
  DEMAND,
  SOLAR_IRRADIATION,
  THERMAL_NETWORK,
} from '../../../Map/Layers/constants';
import { useGetMapLayerCategories } from '../../../Map/Layers/hooks';

const MapLayersCard = () => {
  const [active, setActive] = useState(null);
  const setSelectedMapCategory = useMapStore(
    (state) => state.setSelectedMapCategory,
  );

  const scenarioName = useSelector((state) => state.project.info.scenario_name);

  const mapLayerCategories = useGetMapLayerCategories();

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
      const layers = mapLayerCategories?.categories?.find(
        (l) => l.name == active,
      );
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
      {mapLayerCategories?.categories?.map((category) => {
        const { name, label } = category;
        return (
          <CategoryIconButton
            key={name}
            onClick={toggleActive}
            category={name}
            label={label}
            active={active == name}
          />
        );
      })}
    </div>
  );
};

const iconMap = {
  [SOLAR_IRRADIATION]: SolarRadiationIcon,
  [THERMAL_NETWORK]: NetworksIcon,
  [DEMAND]: DemandForecastingIcon,
};

const CategoryIconButton = ({ category, label, onClick, active }) => {
  const _icon = iconMap?.[category] || GraphsIcon;
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
    <Tooltip title={label || category} overlayInnerStyle={{ fontSize: 12 }}>
      <_icon
        className="cea-card-toolbar-icon"
        style={style}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default MapLayersCard;