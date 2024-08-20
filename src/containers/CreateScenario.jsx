import {
  Button,
  Col,
  Divider,
  List,
  Modal,
  Result,
  Row,
  Spin,
  Steps,
} from 'antd';
import { lazy, memo, useCallback, useEffect, useRef, useState } from 'react';
import NameForm from '../components/Project/CreateScenarioForms/NameForm';
import DatabaseForm from '../components/Project/CreateScenarioForms/DatabaseForm';
import GeometryForm from '../components/Project/CreateScenarioForms/GeometryForm';
import TypologyForm from '../components/Project/CreateScenarioForms/TypologyForm';
import ContextForm from '../components/Project/CreateScenarioForms/ContextForm';
import { useSelector } from 'react-redux';
import {
  MapFormContext,
  useFetchDatabases,
  useFetchWeather,
} from '../components/Project/CreateScenarioForms/hooks';
import { GENERATE_ZONE_CEA } from '../components/Project/CreateScenarioForms/constants';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { useOpenScenario } from '../components/Project/Project';

const EditableMap = lazy(() => import('../components/Map/EditableMap'));

const useCreateScenario = (projectPath, { onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState();

  const createScenario = async (data) => {
    setError(null);
    setFetching(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CEA_URL}/api/project/scenario/v2`,
        { ...data, project: projectPath },
      );
      onSuccess?.(response.data);
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (formData?.scenario_name && projectPath) {
      createScenario(formData);
    }
  }, [formData, projectPath]);

  return { setFormData, fetching, error };
};

const CreateScenarioProgressModal = ({
  showModal,
  setShowModal,
  success,
  error,
  fetching,
}) => {
  return (
    <Modal
      centered
      closable={false}
      footer={null}
      open={showModal}
      width="50vw"
    >
      <div
        style={{
          height: 300,
        }}
      >
        {fetching && (
          <Spin
            tip="Creating scenario..."
            indicator={<LoadingOutlined spin />}
            size="large"
          >
            <div style={{ height: 300 }} />
          </Spin>
        )}
        {error && (
          <Result
            status="error"
            title="Scenario creation failed"
            subTitle="There was an error while creating the scenario"
            extra={[
              <Button
                type="primary"
                key="console"
                onClick={() => setShowModal(false)}
              >
                Back
              </Button>,
            ]}
          />
        )}
        {success && (
          <Result
            status="success"
            title="Scenario created successfully"
            subTitle="redirecting to input editor..."
          />
        )}
      </div>
    </Modal>
  );
};

const CreateScenarioForm = memo(({ setSecondary }) => {
  const {
    info: { project },
  } = useSelector((state) => state.project);
  const openScenario = useOpenScenario();
  const { setFormData, fetching, error } = useCreateScenario(project, {
    // Redirect to input editor when scenario is created
    onSuccess: ({ scenario_name }) => {
      setSuccess(true);
      // Delay before redirecting to input editor
      setTimeout(() => openScenario(project, scenario_name), 1000);
    },
  });

  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({});
  const databases = useFetchDatabases();
  const weather = useFetchWeather();

  const onChange = (values) => {
    setData((prev) => ({ ...prev, ...values }));
  };

  const onBack = () => {
    setCurrent(current - 1);
  };

  const onFinish = (values) => {
    if (current < forms.length - 1) {
      setData((prev) => ({ ...prev, ...values }));
      setCurrent(current + 1);
    } else {
      setData((prev) => {
        const allFormData = { ...prev, ...values };
        setFormData(allFormData);
        return allFormData;
      });
      setShowModal(true);
    }
  };

  const onGeometryFinish = (values) => {
    setData((prev) => ({ ...prev, ...values }));

    // Skip typology if user geometry is generated
    if (values?.user_zone === GENERATE_ZONE_CEA) {
      setCurrent(current + 2);
    } else {
      setCurrent(current + 1);
    }
  };

  const onContextBack = () => {
    // Skip typology if user geometry is generated
    if (data?.user_zone === GENERATE_ZONE_CEA) {
      setCurrent(current - 2);
    } else {
      setCurrent(current - 1);
    }
  };

  const forms = [
    {
      description: 'Name',
      content: (
        <NameForm
          initialValues={data}
          onFinish={onFinish}
          onMount={() => setSecondary('scenarioList')}
        />
      ),
    },
    {
      description: 'Database',
      content: (
        <DatabaseForm
          databases={databases}
          initialValues={data}
          onChange={onChange}
          onBack={onBack}
          onFinish={onFinish}
          onMount={() => setSecondary()}
        />
      ),
    },
    {
      description: 'Geometries',
      content: (
        <GeometryForm
          initialValues={data}
          onChange={onChange}
          onBack={onBack}
          onFinish={onGeometryFinish}
          setSecondary={setSecondary}
        />
      ),
    },
    {
      description: 'Typology',
      content: (
        <TypologyForm
          initialValues={data}
          onChange={onChange}
          onBack={onBack}
          onFinish={onFinish}
          onMount={() => setSecondary()}
        />
      ),
    },
    {
      description: 'Context',
      content: (
        <ContextForm
          weather={weather}
          initialValues={data}
          onChange={onChange}
          onBack={onContextBack}
          onFinish={onFinish}
          onMount={() => setSecondary()}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 24,
        boxSizing: 'border-box',
        border: '1px solid #eee',
        borderRadius: 8,
        minWidth: 600,
        background: '#fff',
        marginLeft: 24,
      }}
    >
      <div>
        <h2>Create Scenario</h2>
        <p>Adds a new Scenario to the current Project.</p>
        <Divider />
      </div>
      <div style={{ flexGrow: 1 }}>{forms[current].content}</div>
      <div style={{ marginTop: 24 }}>
        <Steps
          current={current}
          labelPlacement="vertical"
          items={forms}
          size="small"
        />
      </div>
      <CreateScenarioProgressModal
        showModal={showModal}
        setShowModal={setShowModal}
        success={success}
        error={error}
        fetching={fetching}
      />
    </div>
  );
});

const ScenarioList = () => {
  const { info } = useSelector((state) => state.project);
  const scenarioNames = info?.scenarios_list || [];

  return (
    <div>
      <div
        style={{
          padding: 24,
        }}
      >
        <h2>Scenarios in current Project</h2>
        <p>{scenarioNames.length} Scenario found</p>
        <List
          dataSource={scenarioNames}
          renderItem={(item) => (
            <List.Item>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {item}
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

const CreateScenario = () => {
  const mapRef = useRef();
  const [viewState, setViewState] = useState();
  const [secondaryName, setSecondary] = useState('');
  const [geojson, setGeojson] = useState();
  const [location, setLocation] = useState();

  const onMapLoad = useCallback((e) => {
    const mapbox = e.target;

    // Store the map instance in the ref
    mapRef.current = mapbox;
  }, []);

  // Use mapbox to determine zoom level based on bbox
  useEffect(() => {
    if (location?.bbox && mapRef.current) {
      const mapbox = mapRef.current;
      const { zoom } = mapbox.cameraForBounds(location.bbox, {
        maxZoom: 18,
      });
      setViewState({
        ...viewState,
        zoom: zoom,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Trigger a refresh so that map is zoomed correctly
      mapbox.zoomTo(mapbox.getZoom());
    } else {
      setViewState(viewState);
    }
  }, [location]);

  const secondaryCards = {
    scenarioList: <ScenarioList />,
    map: (
      <EditableMap
        viewState={viewState}
        onViewStateChange={setViewState}
        polygon={geojson}
        onPolygonChange={setGeojson}
        onMapLoad={onMapLoad}
      />
    ),
  };

  return (
    <Row style={{ height: '100%' }}>
      <Col span={12}>{secondaryCards?.[secondaryName]}</Col>
      <Col span={12}>
        <MapFormContext.Provider value={{ geojson, setLocation }}>
          <CreateScenarioForm setSecondary={setSecondary} />
        </MapFormContext.Provider>
      </Col>
    </Row>
  );
};

export default CreateScenario;
