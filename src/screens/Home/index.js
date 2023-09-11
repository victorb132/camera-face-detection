import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

import neutralImg from '../../assets/neutral.png';
import smillingImg from '../../assets/smilling.png';
import winkinglImg from '../../assets/winking.png';

import { styles } from './styles';

export default function Home() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [emoji, setEmoji] = useState(neutralImg);
  const [type, setType] = useState(CameraType.back);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })

  function handleFacesDetected({ faces }) {
    const face = faces[0];

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      }

      setFaceDetected(true);

      if (face.smilingProbability > 0.5) {
        setEmoji(smillingImg);
      } else if (face.leftEyeOpenProbability < 0.5 && face.rightEyeOpenProbability > 0.5) {
        setEmoji(winkinglImg);
      } else {
        setEmoji(neutralImg);
      }

    } else {
      setFaceDetected(false);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return;
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      {faceDetected && <Animated.Image
        style={[animatedStyle, styles.emoji]}
        source={emoji}
      />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          <Text style={styles.text}>Mudar Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
