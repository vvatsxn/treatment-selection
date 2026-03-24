import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, Modal, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { pippTheme } from '../theme/pipp';
import PIPPButton from '../components/PIPPButton';
import { QRCodeSVG } from 'qrcode.react';

const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /android|iphone|ipad|ipod|webos|blackberry|windows phone|opera mini|iemobile|mobile/i.test(ua)
    || (navigator.maxTouchPoints > 0 && /Macintosh/i.test(ua));
};

const getDeliveryDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() + 1);
  const end = new Date(today);
  let workingDays = 0;
  while (workingDays < 4) {
    end.setDate(end.getDate() + 1);
    const day = end.getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}\u2013${end.getDate()} ${months[start.getMonth()]}`;
  }
  return `${start.getDate()} ${months[start.getMonth()]} \u2013 ${end.getDate()} ${months[end.getMonth()]}`;
};

const PhotoCaptureScreen: React.FC = () => {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const pathname = window.location.pathname;
  const isUploadPage = pathname.startsWith('/photo-capture/upload');
  const isCameraPage = pathname.startsWith('/photo-capture/camera');

  const isMobile = isMobileOrTablet();

  // Captured photos state
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({});
  const [photoReceived, setPhotoReceived] = useState(false);

  // Camera page state
  const [cameraPageState, setCameraPageState] = useState<'loading' | 'ready' | 'success'>('loading');
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Session ID for cross-device QR flow
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(2, 10));
  const cameraSessionId = new URLSearchParams(window.location.search).get('session');

  // QR modal state (desktop)
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Submit confirmation modal state
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [submitModalMounted, setSubmitModalMounted] = useState(false);
  const submitSlideAnim = useRef(new Animated.Value(600)).current;
  const submitFadeAnim = useRef(new Animated.Value(0)).current;

  // Hidden file input refs (mobile)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Custom in-app camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraButtonId, setCameraButtonId] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedTimer, setSelectedTimer] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle file capture from input
  const handleFileCapture = (buttonId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCapturedPhotos(prev => ({ ...prev, [buttonId]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Desktop: poll API for photos when QR modal is open
  React.useEffect(() => {
    if (!qrModalVisible) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/photo?session=${sessionIdRef.current}`);
        const data = await res.json();
        if (data.found && data.dataUrl) {
          setPhotoReceived(true);
          setCapturedPhotos(prev => ({ ...prev, ['qrPhoto']: data.dataUrl }));
          clearInterval(interval);
        }
      } catch (e) { /* ignore polling errors */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [qrModalVisible]);

  // Camera page: skip straight to ready (programmatic .click() blocked on mobile)
  React.useEffect(() => {
    if (isCameraPage) setCameraPageState('ready');
  }, [isCameraPage]);

  React.useEffect(() => {
    if (qrModalVisible) {
      setModalMounted(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      });
    } else if (modalMounted) {
      Animated.timing(slideAnim, { toValue: 600, duration: 300, useNativeDriver: true }).start(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setModalMounted(false);
        });
      });
    }
  }, [qrModalVisible]);

  React.useEffect(() => {
    if (submitModalVisible) {
      setSubmitModalMounted(true);
      Animated.timing(submitFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        Animated.timing(submitSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      });
    } else if (submitModalMounted) {
      Animated.timing(submitSlideAnim, { toValue: 600, duration: 300, useNativeDriver: true }).start(() => {
        Animated.timing(submitFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setSubmitModalMounted(false);
        });
      });
    }
  }, [submitModalVisible]);

  // Camera lifecycle: start/stop stream
  const startCameraStream = async (facingMode: 'environment' | 'user') => {
    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      // Detect native zoom support
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities?.zoom) {
          setMaxZoom(Math.min(capabilities.zoom.max, 10));
          setZoomLevel(capabilities.zoom.min || 1);
        } else {
          setMaxZoom(1);
          setZoomLevel(1);
        }
      }
    } catch (err) {
      // getUserMedia failed (no HTTPS, permission denied, etc.) -- fall back to native file input
      setCameraActive(false);
      if (cameraButtonId) {
        const input = fileInputRefs.current[cameraButtonId];
        if (input) input.click();
      }
    }
  };

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // Use callback ref to start stream once video element is in the DOM
  const videoCallbackRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && cameraActive && !capturedFrame && !streamRef.current) {
      startCameraStream(cameraFacingMode);
    }
  };

  // Cleanup on unmount or camera close
  React.useEffect(() => {
    return () => {
      stopCameraStream();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Handle facingMode change while camera is active
  React.useEffect(() => {
    if (cameraActive && !capturedFrame && videoRef.current) {
      startCameraStream(cameraFacingMode);
    }
  }, [cameraFacingMode]);

  // Capture a frame from the video
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedFrame(dataUrl);
    stopCameraStream();
  };

  // Handle capture button press (with optional timer)
  const handleCapturePress = () => {
    if (countdown !== null) {
      // Cancel active countdown
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(null);
      return;
    }
    if (selectedTimer === 0) {
      capturePhoto();
    } else {
      setCountdown(selectedTimer);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = null;
            capturePhoto();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Use captured photo
  const handleUsePhoto = () => {
    if (capturedFrame && cameraButtonId) {
      setCapturedPhotos(prev => ({ ...prev, [cameraButtonId]: capturedFrame }));
    }
    setCameraActive(false);
    setCapturedFrame(null);
    setCameraButtonId(null);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedFrame(null);
    startCameraStream(cameraFacingMode);
  };

  // Close camera
  const handleCloseCamera = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    stopCameraStream();
    setCameraActive(false);
    setCapturedFrame(null);
    setCameraButtonId(null);
    setCountdown(null);
    setZoomLevel(1);
  };

  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      const constraints = { advanced: [{ zoom: newZoom } as any] };
      track.applyConstraints(constraints).catch(() => {});
    }
  };

  const handleCloseSubmitModal = () => {
    setSubmitModalVisible(false);
  };

  const handleUploadButtonPress = (buttonId: string) => {
    if (isMobile) {
      setCameraButtonId(buttonId);
      setCameraActive(true);
      setCapturedFrame(null);
      setCountdown(null);
      setSelectedTimer(0);
    } else {
      setQrModalVisible(true);
    }
  };

  const handleCloseQrModal = () => {
    setQrModalVisible(false);
    setPhotoReceived(false);
  };

  // Camera page (opened via QR code scan)
  if (isCameraPage) {
    const compressImage = (file: File, maxDim: number, quality: number): Promise<string> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
            else { width = Math.round(width * maxDim / height); height = maxDim; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = url;
      });
    };

    const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setCameraPageState('success');
        if (cameraSessionId) {
          try {
            // Compress to max 400px, 0.6 quality to stay under Redis size limits
            const compressedDataUrl = await compressImage(file, 400, 0.6);
            await fetch(`/api/photo?session=${cameraSessionId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: compressedDataUrl }),
            });
          } catch (err) { /* ignore */ }
        }
      }
    };

    return (
      <View style={styles.outerContainer}>
        <View style={styles.uploadHeader}>
          <View style={styles.uploadHeaderRow}>
            <View style={styles.uploadBackPlaceholder} />
            <Image source={require('../images/phlo-clinic-logo-default.png')} style={styles.headerLogo} resizeMode="contain" accessibilityLabel="Phlo Clinic logo" />
            <View style={styles.uploadBackPlaceholder} />
          </View>
        </View>
        <View style={styles.cameraPageContent}>
          <View style={styles.cameraPageCenter}>
            {cameraPageState === 'ready' && (
              <View style={styles.cameraStateContainer}>
                <Text style={styles.cameraStateHeading}>Take your photo</Text>
                <Text style={styles.cameraStateSubtext}>Tap the button below to open your camera and take a photo.</Text>
              </View>
            )}
            {cameraPageState === 'success' && (
              <View style={styles.cameraStateContainer}>
                <Image source={require('../theme/icons/check_circle.svg')} style={styles.cameraSuccessIcon} resizeMode="contain" />
                <Text style={styles.cameraStateHeading}>Photo sent!</Text>
                <Text style={styles.cameraStateSubtext}>You can now return to your desktop to continue.</Text>
              </View>
            )}
          </View>
          {cameraPageState === 'ready' && (
            <View style={styles.cameraPageFooter}>
              <PIPPButton text="Open camera" onPress={() => { if (cameraInputRef.current) cameraInputRef.current.click(); }} />
            </View>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            onChange={handleCameraCapture}
          />
        </View>
      </View>
    );
  }

  if (isUploadPage) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.uploadHeader}>
          <View style={styles.uploadHeaderRow}>
            <View
              style={styles.uploadBackButton}
              onTouchEnd={() => {
                window.history.back();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Image
                source={require('../theme/icons/arrow-back.svg')}
                style={styles.uploadBackIcon}
                resizeMode="contain"
              />
            </View>
            <Image
              source={require('../images/phlo-clinic-logo-default.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityLabel="Phlo Clinic logo"
            />
            <View style={styles.uploadBackPlaceholder} />
          </View>
        </View>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.uploadScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.uploadMainContent}>
              <View style={styles.uploadHeaderGroup}>
                <Text style={styles.uploadHeadingLarge}>Upload your photos</Text>
                <Text style={styles.uploadSubtext}>We need each type of photo below to verify your reported weight.</Text>
                <View style={styles.uploadSecurityBox}>
                  <Image
                    source={require('../theme/icons/verified-user.svg')}
                    style={styles.uploadSecurityIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.uploadSecurityTextGroup}>
                    <Text style={styles.uploadSecurityTitle}>Your photos are stored securely</Text>
                    <Text style={styles.uploadSecurityBody}>
                      {'Encrypted and reviewed '}
                      <Text style={styles.uploadSecurityBodyBold}>only</Text>
                      {' by licensed clinicians. '}
                      <Text style={styles.uploadSecurityBodyBold}>We delete Photo ID</Text>
                      {' after 90 days.'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.uploadDivider} />

              {/* Photo ID section */}
              <View style={styles.photoIdSection}>
                <Text style={styles.photoIdHeading}>Photo ID</Text>
                <Text style={styles.photoIdBody}>
                  {'We need '}
                  <Text style={styles.photoIdBodyBold}>one</Text>
                  {' clear photo of your ID to verify your identity, as required by clinical protocol.'}
                </Text>
                <View style={styles.photoIdExamplesWrap}>
                  <View style={styles.photoIdExamplesRow}>
                    <Image
                      source={require('../images/Example-Driving-License-ID.png')}
                      style={styles.photoIdExampleImage}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../images/Example-Passport-ID.png')}
                      style={styles.photoIdExampleImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.acceptedIdList}>
                    <Text style={styles.acceptedIdLabel}>Accepted photo ID:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Valid passport (UK or any country)</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Driving licence (UK or EEA, full or provisional)</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>PASS card</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Biometric Residence Permit (BRP)</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>National ID card</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>HM Armed Forces or Police ID</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Government issued photocard travel pass</Text>
                    </View>
                    <Text style={styles.notAcceptedLabel}>Not accepted:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Screenshots, photocopies, or expired documents</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Work badges or student cards</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Upload photo ID dropzone */}
              {capturedPhotos['selectPhotoId'] ? (
                <View style={styles.capturedDropzone}>
                  <img src={capturedPhotos['selectPhotoId']} style={styles.capturedThumbnail as any} />
                  <View style={styles.capturedInfo}>
                    <View style={styles.capturedCheckRow}>
                      <Image source={require('../theme/icons/check_circle.svg')} style={styles.capturedCheckIcon} resizeMode="contain" />
                      <Text style={styles.capturedText}>Photo captured</Text>
                    </View>
                    <View
                      style={[styles.retakeButton, hoveredBtn === 'retakePhotoId' && styles.secondaryButtonHover]}
                      onMouseEnter={() => setHoveredBtn('retakePhotoId')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      {...{ onClick: () => handleUploadButtonPress('selectPhotoId') } as any}
                    >
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </View>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectPhotoId'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectPhotoId', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              ) : (
                <View style={styles.uploadDropzone}>
                  <View
                    style={[styles.secondaryButton, hoveredBtn === 'selectPhotoId' && styles.secondaryButtonHover, pressedBtn === 'selectPhotoId' && styles.secondaryButtonPressed]}
                    onMouseEnter={() => setHoveredBtn('selectPhotoId')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onMouseDown={() => setPressedBtn('selectPhotoId')}
                    onMouseUp={() => setPressedBtn(null)}
                    {...{ onClick: () => handleUploadButtonPress('selectPhotoId') } as any}
                  >
                    <Text style={styles.secondaryButtonText}>{isMobile ? 'Take photo ID' : 'Select photo ID'}</Text>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectPhotoId'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectPhotoId', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              )}

              <View style={styles.uploadDivider} />

              {/* Weight evidence section */}
              <View style={styles.weightEvidenceSection}>
                <Text style={styles.photoIdHeading}>Now upload: Weight evidence</Text>

                {/* Front-facing photo */}
                <View style={styles.weightSubsection}>
                  <Text style={styles.weightSubsectionTitle}>1. Front-facing photo of yourself</Text>
                  <View style={styles.weightContentRow}>
                    <img
                      src={require('../images/front-facing-img.jpg')}
                      style={styles.weightImgTag as any}
                    />
                    <View style={styles.acceptedIdList}>
                      <Text style={styles.acceptedIdLabel}>Do:</Text>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Include full body and face</Text>
                      </View>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Wear lightweight clothing</Text>
                      </View>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Take the photo today</Text>
                      </View>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Clear and well lit</Text>
                      </View>
                      <Text style={styles.notAcceptedLabel}>Don{'\u2019'}t:</Text>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Include other people</Text>
                      </View>
                      <View style={styles.acceptedIdRow}>
                        <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                        <Text style={styles.acceptedIdText}>Use holiday or social photos</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Upload front-facing photo dropzone */}
                {capturedPhotos['selectFront'] ? (
                  <View style={styles.capturedDropzone}>
                    <img src={capturedPhotos['selectFront']} style={styles.capturedThumbnail as any} />
                    <View style={styles.capturedInfo}>
                      <View style={styles.capturedCheckRow}>
                        <Image source={require('../theme/icons/check_circle.svg')} style={styles.capturedCheckIcon} resizeMode="contain" />
                        <Text style={styles.capturedText}>Photo captured</Text>
                      </View>
                      <View
                        style={[styles.retakeButton, hoveredBtn === 'retakeFront' && styles.secondaryButtonHover]}
                        onMouseEnter={() => setHoveredBtn('retakeFront')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        {...{ onClick: () => handleUploadButtonPress('selectFront') } as any}
                      >
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </View>
                    </View>
                    {isMobile && (
                      <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectFront'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectFront', file); if (e.target) e.target.value = ''; }} />
                    )}
                  </View>
                ) : (
                  <View style={styles.uploadDropzone}>
                    <View
                      style={[styles.secondaryButton, hoveredBtn === 'selectFront' && styles.secondaryButtonHover, pressedBtn === 'selectFront' && styles.secondaryButtonPressed]}
                      onMouseEnter={() => setHoveredBtn('selectFront')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      onMouseDown={() => setPressedBtn('selectFront')}
                      onMouseUp={() => setPressedBtn(null)}
                      {...{ onClick: () => handleUploadButtonPress('selectFront') } as any}
                    >
                      <Text style={styles.secondaryButtonText}>{isMobile ? 'Take front-facing photo' : 'Select front-facing photo'}</Text>
                    </View>
                    {isMobile && (
                      <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectFront'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectFront', file); if (e.target) e.target.value = ''; }} />
                    )}
                  </View>
                )}
              </View>

              <View style={styles.uploadDivider} />

              {/* 2. Side-on photo */}
              <View style={styles.weightSubsection}>
                <Text style={styles.weightSubsectionTitle}>2. Side-on photo of yourself</Text>
                <View style={styles.weightContentRow}>
                  <img
                    src={require('../images/side-profile-img.jpg')}
                    style={styles.weightImgTag as any}
                  />
                  <View style={styles.acceptedIdList}>
                    <Text style={styles.acceptedIdLabel}>Do:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Include full body and face</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Wear lightweight clothing</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Take the photo today</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Clear and well lit</Text>
                    </View>
                    <Text style={styles.notAcceptedLabel}>Don{'\u2019'}t:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Include other people</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Use holiday or social photos</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Upload side-on photo dropzone */}
              {capturedPhotos['selectSide'] ? (
                <View style={styles.capturedDropzone}>
                  <img src={capturedPhotos['selectSide']} style={styles.capturedThumbnail as any} />
                  <View style={styles.capturedInfo}>
                    <View style={styles.capturedCheckRow}>
                      <Image source={require('../theme/icons/check_circle.svg')} style={styles.capturedCheckIcon} resizeMode="contain" />
                      <Text style={styles.capturedText}>Photo captured</Text>
                    </View>
                    <View
                      style={[styles.retakeButton, hoveredBtn === 'retakeSide' && styles.secondaryButtonHover]}
                      onMouseEnter={() => setHoveredBtn('retakeSide')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      {...{ onClick: () => handleUploadButtonPress('selectSide') } as any}
                    >
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </View>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectSide'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectSide', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              ) : (
                <View style={styles.uploadDropzone}>
                  <View
                    style={[styles.secondaryButton, hoveredBtn === 'selectSide' && styles.secondaryButtonHover, pressedBtn === 'selectSide' && styles.secondaryButtonPressed]}
                    onMouseEnter={() => setHoveredBtn('selectSide')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onMouseDown={() => setPressedBtn('selectSide')}
                    onMouseUp={() => setPressedBtn(null)}
                    {...{ onClick: () => handleUploadButtonPress('selectSide') } as any}
                  >
                    <Text style={styles.secondaryButtonText}>{isMobile ? 'Take side-on photo' : 'Select side-on photo'}</Text>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectSide'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectSide', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              )}

              <View style={styles.uploadDivider} />

              {/* 3. Weight reading photo */}
              <View style={styles.weightSubsection}>
                <Text style={styles.weightSubsectionTitle}>3. Photo of your current weight reading</Text>
                <View style={styles.weightSubcopyWrap}>
                  <Text style={styles.photoIdBody}>Standing on weighing scale, in-store weighing scales slip or a smart scales app screenshot.</Text>
                </View>
                <View style={styles.weightContentRow}>
                  <img
                    src={require('../images/scale-img.jpg')}
                    style={styles.weightImgTag as any}
                  />
                  <View style={styles.acceptedIdList}>
                    <Text style={styles.acceptedIdLabel}>Do:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Show weight clearly</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Include your toes</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Take the photo today</Text>
                    </View>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/check-circle-outline.svg')} style={styles.acceptedIdIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Clear and well lit</Text>
                    </View>
                    <Text style={styles.notAcceptedLabel}>Don{'\u2019'}t:</Text>
                    <View style={styles.acceptedIdRow}>
                      <Image source={require('../theme/icons/close.svg')} style={styles.notAcceptedIcon} resizeMode="contain" />
                      <Text style={styles.acceptedIdText}>Blur or crop the display</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Upload weight reading photo dropzone */}
              {capturedPhotos['selectWeight'] ? (
                <View style={styles.capturedDropzone}>
                  <img src={capturedPhotos['selectWeight']} style={styles.capturedThumbnail as any} />
                  <View style={styles.capturedInfo}>
                    <View style={styles.capturedCheckRow}>
                      <Image source={require('../theme/icons/check_circle.svg')} style={styles.capturedCheckIcon} resizeMode="contain" />
                      <Text style={styles.capturedText}>Photo captured</Text>
                    </View>
                    <View
                      style={[styles.retakeButton, hoveredBtn === 'retakeWeight' && styles.secondaryButtonHover]}
                      onMouseEnter={() => setHoveredBtn('retakeWeight')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      {...{ onClick: () => handleUploadButtonPress('selectWeight') } as any}
                    >
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </View>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectWeight'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectWeight', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              ) : (
                <View style={styles.uploadDropzone}>
                  <View
                    style={[styles.secondaryButton, hoveredBtn === 'selectWeight' && styles.secondaryButtonHover, pressedBtn === 'selectWeight' && styles.secondaryButtonPressed]}
                    onMouseEnter={() => setHoveredBtn('selectWeight')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onMouseDown={() => setPressedBtn('selectWeight')}
                    onMouseUp={() => setPressedBtn(null)}
                    {...{ onClick: () => handleUploadButtonPress('selectWeight') } as any}
                  >
                    <Text style={styles.secondaryButtonText}>{isMobile ? 'Take weight reading photo' : 'Select weight reading photo'}</Text>
                  </View>
                  {isMobile && (
                    <input type="file" accept="image/*" capture="environment" ref={(el) => { fileInputRefs.current['selectWeight'] = el; }} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileCapture('selectWeight', file); if (e.target) e.target.value = ''; }} />
                  )}
                </View>
              )}

              <View style={styles.uploadDivider} />

              <View style={styles.warningBanner}>
                <Text style={styles.warningBannerText}>
                  Any edited, filtered or AI-generated photos will result in your order being <Text style={styles.warningBannerBold}>rejected</Text> and future requests declined.
                </Text>
              </View>

              <PIPPButton text="Complete upload" onPress={() => setSubmitModalVisible(true)} />

              <View style={styles.uploadBottomSpacer} />
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* QR Code Modal for Desktop */}
        {modalMounted && (
          <View style={styles.qrOverlay}>
            <Animated.View style={[styles.qrOverlayBg, { opacity: fadeAnim }]}>
              <View style={styles.qrOverlayTouchable} {...{ onClick: handleCloseQrModal } as any} />
            </Animated.View>
            <Animated.View style={[styles.qrModalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.qrModalInner}>
                <View style={styles.qrModalHeader}>
                  <Text style={styles.qrModalHeading}>Take photos on your mobile</Text>
                  <View style={styles.qrCloseButton} {...{ onClick: handleCloseQrModal } as any} accessibilityRole="button">
                    <Image source={require('../theme/icons/close.svg')} style={styles.qrCloseIcon} resizeMode="contain" />
                  </View>
                </View>

                <View style={styles.qrCodeSection}>
                  <View style={styles.qrCodeWrapper}>
                    <QRCodeSVG
                      value={`${window.location.origin}/photo-capture/camera?session=${sessionIdRef.current}`}
                      size={180}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#07073D"
                    />
                  </View>
                  <Text style={styles.qrInstructionText}>
                    Scan this QR code with your phone camera to open the upload page and take your photos directly.
                  </Text>
                </View>

                <View style={styles.qrDivider} />

                <View style={styles.qrWaitingSection}>
                  {photoReceived ? (
                    <>
                      {capturedPhotos['qrPhoto'] && (
                        <img src={capturedPhotos['qrPhoto']} style={styles.qrReceivedThumbnail as any} />
                      )}
                      <Image source={require('../theme/icons/check_circle.svg')} style={styles.qrReceivedIcon} resizeMode="contain" />
                      <Text style={styles.qrWaitingText}>Photo received!</Text>
                      <Text style={styles.qrWaitingSubtext}>
                        Your photo has been received from your mobile device.
                      </Text>
                    </>
                  ) : (
                    <>
                      <ActivityIndicator size="small" color="#086A74" />
                      <Text style={styles.qrWaitingText}>Waiting for photos...</Text>
                      <Text style={styles.qrWaitingSubtext}>
                        Once you{'\u2019'}ve taken your photos on your mobile device, they{'\u2019'}ll appear here automatically.
                      </Text>
                    </>
                  )}
                </View>

                <PIPPButton text="Cancel" onPress={handleCloseQrModal} variant="secondary" />
              </View>
            </Animated.View>
          </View>
        )}

        {/* Submit Confirmation Modal */}
        {submitModalMounted && (
          <View style={styles.qrOverlay}>
            <Animated.View style={[styles.qrOverlayBg, { opacity: submitFadeAnim }]}>
              <View style={styles.qrOverlayTouchable} {...{ onClick: handleCloseSubmitModal } as any} />
            </Animated.View>
            <Animated.View style={[styles.qrModalContainer, { transform: [{ translateY: submitSlideAnim }] }]}>
              <View style={styles.qrModalInner}>
                <Text style={styles.submitModalHeading}>Before you submit your photos</Text>

                <Text style={styles.submitModalBody}>
                  To avoid delays, please make sure you{'\u2019'}ve uploaded everything currently required for your order.
                </Text>

                {/* Checklist card */}
                <View style={styles.submitChecklistCard}>
                  <Text style={styles.submitChecklistLabel}>First time upload</Text>
                  <View style={styles.submitChecklistItems}>
                    <View style={styles.submitChecklistRow}>
                      <Image
                        source={capturedPhotos['selectPhotoId'] ? require('../theme/icons/check_circle.svg') : require('../theme/icons/close.svg')}
                        style={[styles.submitChecklistIcon, capturedPhotos['selectPhotoId'] ? styles.submitChecklistIconGreen : styles.submitChecklistIconRed]}
                        resizeMode="contain"
                      />
                      <Text style={styles.submitChecklistText}>Photo ID</Text>
                    </View>
                    <View style={styles.submitChecklistRow}>
                      <Image
                        source={capturedPhotos['selectFront'] ? require('../theme/icons/check_circle.svg') : require('../theme/icons/close.svg')}
                        style={[styles.submitChecklistIcon, capturedPhotos['selectFront'] ? styles.submitChecklistIconGreen : styles.submitChecklistIconRed]}
                        resizeMode="contain"
                      />
                      <Text style={styles.submitChecklistText}>Front-facing photo</Text>
                    </View>
                    <View style={styles.submitChecklistRow}>
                      <Image
                        source={capturedPhotos['selectSide'] ? require('../theme/icons/check_circle.svg') : require('../theme/icons/close.svg')}
                        style={[styles.submitChecklistIcon, capturedPhotos['selectSide'] ? styles.submitChecklistIconGreen : styles.submitChecklistIconRed]}
                        resizeMode="contain"
                      />
                      <Text style={styles.submitChecklistText}>Side-on photo</Text>
                    </View>
                    <View style={styles.submitChecklistRow}>
                      <Image
                        source={capturedPhotos['selectWeight'] ? require('../theme/icons/check_circle.svg') : require('../theme/icons/close.svg')}
                        style={[styles.submitChecklistIcon, capturedPhotos['selectWeight'] ? styles.submitChecklistIconGreen : styles.submitChecklistIconRed]}
                        resizeMode="contain"
                      />
                      <Text style={styles.submitChecklistText}>Weight reading</Text>
                    </View>
                  </View>
                </View>

                {/* Info banner */}
                <View style={styles.submitInfoBanner}>
                  <Image source={require('../theme/icons/info-outline.svg')} style={styles.submitInfoIcon} resizeMode="contain" />
                  <View style={styles.submitInfoTextWrap}>
                    <Text style={styles.submitInfoHeading}>If your order was put on hold</Text>
                    <Text style={styles.submitInfoBody}>
                      Check your email for details on which additional photos are needed and upload them before submitting.
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.submitButtonsWrap}>
                  <PIPPButton text="Submit photos for review" onPress={() => { setSubmitModalVisible(false); }} />
                  <View
                    style={[styles.submitGoBackButton, hoveredBtn === 'goBackReview' && styles.secondaryButtonHover]}
                    onMouseEnter={() => setHoveredBtn('goBackReview')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    {...{ onClick: handleCloseSubmitModal } as any}
                  >
                    <Image source={require('../theme/icons/arrow-back.svg')} style={styles.submitGoBackIcon} resizeMode="contain" />
                    <Text style={styles.secondaryButtonText}>Go back and review uploads</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Custom In-App Camera */}
        {cameraActive && (
          <View style={styles.cameraOverlay}>
            {capturedFrame === null ? (
              <>
                <video
                  ref={videoCallbackRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: 'absolute' as any,
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as any,
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Top controls */}
                <View style={styles.cameraTopBar}>
                  <View style={styles.cameraTopButton} {...{ onClick: handleCloseCamera } as any}>
                    <Image source={require('../theme/icons/close.svg')} style={styles.cameraTopIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.cameraTopButton} {...{ onClick: () => setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment') } as any}>
                    <Image source={require('../theme/icons/swap.svg')} style={styles.cameraTopIcon} resizeMode="contain" />
                  </View>
                </View>

                {/* Countdown overlay */}
                {countdown !== null && (
                  <View style={styles.countdownOverlay}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                )}

                {/* Bottom controls */}
                <View style={styles.cameraBottomBar}>
                  <View style={styles.timerRow}>
                    {[3, 5, 10].map(t => (
                      <View
                        key={t}
                        style={[styles.timerButton, selectedTimer === t && styles.timerButtonActive]}
                        {...{ onClick: () => setSelectedTimer(prev => prev === t ? 0 : t) } as any}
                      >
                        <Text style={[styles.timerButtonText, selectedTimer === t && styles.timerButtonTextActive]}>{t}s</Text>
                      </View>
                    ))}
                  </View>
                  {maxZoom > 1 && (
                    <View style={styles.zoomRow}>
                      <Text style={styles.zoomLabel}>1x</Text>
                      <input
                        type="range"
                        min="1"
                        max={maxZoom}
                        step="0.1"
                        value={zoomLevel}
                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                        style={{
                          flex: 1,
                          height: 28,
                          accentColor: '#FFFFFF',
                        }}
                      />
                      <Text style={styles.zoomLabel}>{maxZoom.toFixed(0)}x</Text>
                    </View>
                  )}
                  <View style={styles.captureButtonOuter} {...{ onClick: handleCapturePress } as any}>
                    <View style={styles.captureButtonInner} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <img
                  src={capturedFrame}
                  style={{
                    position: 'absolute' as any,
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as any,
                  }}
                />
                <View style={styles.reviewBottomBar}>
                  <View style={styles.reviewButtonsRow}>
                    <View
                      style={styles.reviewRetakeButton}
                      {...{ onClick: handleRetake } as any}
                    >
                      <Text style={styles.reviewRetakeText}>Retake</Text>
                    </View>
                    <View style={styles.reviewUseButtonWrap}>
                      <PIPPButton text="Use photo" onPress={handleUsePhoto} />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Header — full width */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../images/phlo-clinic-logo-default.png')}
            style={styles.headerLogo}
            resizeMode="contain"
            accessibilityLabel="Phlo Clinic logo"
          />
          <View style={styles.headerSpacer} />
          <Image
            source={require('../theme/icons/menu.svg')}
            style={styles.headerMenuIcon}
            resizeMode="contain"
            accessibilityLabel="Menu"
          />
        </View>
      </View>

      {/* Content — constrained width */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            <Image
              source={require('../images/party-popper.png')}
              style={styles.popperImage}
              resizeMode="contain"
            />
            <View style={styles.textGroup}>
              <Text style={styles.heading}>Thanks for your order!</Text>
              <View style={styles.emailGroup}>
                <Text style={styles.bodyText}>An email confirmation has been sent to</Text>
                <Text style={styles.emailText}>calum.watson@wearephlo.com</Text>
              </View>
            </View>
            <View style={styles.reviewBanner}>
              <Text style={styles.bodyText}>We aim to review all orders within 72 hours during weekdays</Text>
            </View>

            {/* Upload card */}
            <View style={styles.uploadCard}>
              <View style={styles.badgePill}>
                <Image
                  source={require('../theme/icons/bolt.svg')}
                  style={styles.badgePillIcon}
                  resizeMode="contain"
                />
                <Text style={styles.badgePillText}>Get approved sooner</Text>
              </View>
              <Text style={styles.uploadHeading}>Upload your supporting photos</Text>
              <Text style={styles.uploadBody}>
                {'To safely prescribe your treatment, we\u2019ll '}
                <Text style={styles.uploadBodyBold}>need the following 4 photos to process your request:</Text>
              </Text>

              <View style={styles.bulletList}>
                <Text style={styles.bulletText}>{'\u2022'} Photo ID</Text>
                <Text style={styles.bulletText}>{'\u2022'} Front-facing photo of yourself</Text>
                <Text style={styles.bulletText}>{'\u2022'} Side-on photo of yourself</Text>
                <Text style={styles.bulletText}>{'\u2022'} Photo of your current weight reading</Text>
              </View>

              <View style={styles.infoBox}>
                <Image
                  source={require('../theme/icons/info-outline.svg')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>
                  <Text style={styles.infoTextBold}>If you</Text>
                  {' are transferring from another provider upload your previous evidence.'}
                </Text>
              </View>

              <PIPPButton
                text="Upload all photos"
                onPress={() => {
                  window.history.pushState({}, '', '/photo-capture/upload');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              />
              <View style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Get more information</Text>
                <Image
                  source={require('../theme/icons/arrow-outward.svg')}
                  style={styles.linkButtonIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Order details card */}
            <View style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <Text style={styles.orderCardHeading}>Order details</Text>
                <Text style={styles.orderCardNumber}>Order #1234-1234-1234-1234</Text>
              </View>
              <View style={styles.orderCardRow}>
                <Image
                  source={require('../theme/icons/medical-bag.svg')}
                  style={styles.orderCardIcon}
                  resizeMode="contain"
                />
                <View style={styles.orderCardInfo}>
                  <Text style={styles.orderCardLabel}>Treatment</Text>
                  <Text style={styles.orderCardTreatment}>
                    {'Mounjaro KwikPen 2.5mg  '}
                    <Text style={styles.orderCardTreatmentSubtle}>1 pre-filled disposable injection supply</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.orderCardDivider} />
              <View style={styles.orderCardRow}>
                <Image
                  source={require('../theme/icons/truck-fast.svg')}
                  style={styles.orderCardIcon}
                  resizeMode="contain"
                />
                <View style={styles.orderCardDeliveryInfo}>
                  <View style={styles.orderCardDeliverySection}>
                    <Text style={styles.orderCardLabel}>Delivery details</Text>
                    <Text style={styles.orderCardText}>14 Marchmont Crescent{'\n'}Edinburgh, EH9 1HQ</Text>
                  </View>
                  <View style={styles.orderCardDeliverySection}>
                    <Text style={styles.orderCardText}>RM Tracked 24</Text>
                    <Text style={styles.orderCardText}>
                      {getDeliveryDateRange()}
                      {' '}
                      <Text style={styles.orderCardTreatmentSubtle}>(Arrives 2{'\u2013'}4 working days after order approval)</Text>
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.orderCardDivider} />
              <View style={styles.orderCardRow}>
                <Image
                  source={require('../theme/icons/cash-money.svg')}
                  style={styles.orderCardIcon}
                  resizeMode="contain"
                />
                <View style={styles.orderCardPaymentInfo}>
                  <Text style={styles.orderCardLabel}>Payment details</Text>
                  <View style={styles.paymentLines}>
                    <View style={styles.paymentLineRow}>
                      <Text style={styles.orderCardText}>Treatment</Text>
                      <Text style={styles.orderCardText}>{'\u00A3'}139.00</Text>
                    </View>
                    <View style={styles.paymentLineRow}>
                      <Text style={styles.orderCardText}>Delivery</Text>
                      <Text style={styles.orderCardText}>Free</Text>
                    </View>
                  </View>
                  <View style={styles.paymentDividerWrap}>
                    <View style={styles.orderCardDivider} />
                  </View>
                  <View style={styles.paymentPaidRow}>
                    <Image
                      source={require('../theme/icons/google-pay.svg')}
                      style={styles.paymentGPayIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.orderCardText}>Paid with Google Pay</Text>
                  </View>
                </View>
              </View>
              <View style={styles.moreInfoButton}>
                <Text style={styles.moreInfoText}>More info</Text>
                <Image
                  source={require('../theme/icons/arrow-forward.svg')}
                  style={styles.moreInfoIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Track your progress card */}
            <View style={styles.trackCard}>
              <Image
                source={require('../images/check-in-img.png')}
                style={styles.trackImage}
                resizeMode="contain"
              />
              <View style={styles.trackHeadingRow}>
                <Text style={styles.trackHeading}>Track your progress</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={styles.trackBody}>You can now view your weight history, track your progression and check when it{'\u2019'}s time to re-order!</Text>
              <PIPPButton
                text="Go to my weight journey"
                onPress={() => {}}
              />
            </View>

            {/* Help card */}
            <View style={styles.helpCard}>
              <View style={styles.helpImageWrap}>
                <Image
                  source={require('../images/patient-care-img.png')}
                  style={styles.helpImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.helpTextGroup}>
                <Text style={styles.helpHeading}>We{'\u2019'}re here to help</Text>
                <Text style={styles.helpBody}>Expore our Phlo Clinic FAQs, where you{'\u2019'}ll find extensive resources to assist you with all your questions and queries.</Text>
              </View>
              <View style={styles.helpButtons}>
                <View
                  style={[styles.secondaryButton, hoveredBtn === 'faqs' && styles.secondaryButtonHover, pressedBtn === 'faqs' && styles.secondaryButtonPressed]}
                  onMouseEnter={() => setHoveredBtn('faqs')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onMouseDown={() => setPressedBtn('faqs')}
                  onMouseUp={() => setPressedBtn(null)}
                >
                  <Text style={styles.secondaryButtonText}>General FAQs</Text>
                  <Image
                    source={require('../theme/icons/arrow-outward.svg')}
                    style={styles.secondaryButtonIcon}
                    resizeMode="contain"
                  />
                </View>
                <View
                  style={[styles.secondaryButton, hoveredBtn === 'help' && styles.secondaryButtonHover, pressedBtn === 'help' && styles.secondaryButtonPressed]}
                  onMouseEnter={() => setHoveredBtn('help')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onMouseDown={() => setPressedBtn('help')}
                  onMouseUp={() => setPressedBtn(null)}
                >
                  <Text style={styles.secondaryButtonText}>Weight Loss Help Centre</Text>
                  <Image
                    source={require('../theme/icons/arrow-outward.svg')}
                    style={styles.secondaryButtonIcon}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.helpDivider} />
              <View style={styles.helpContactSection}>
                <View style={styles.helpContactTextGroup}>
                  <Text style={styles.helpHeading}>Need to talk?</Text>
                  <Text style={styles.helpBody}>
                    {'We\u2019re available '}
                    <Text style={styles.helpBodyBold}>9am to 5pm on weekdays</Text>
                    {' and '}
                    <Text style={styles.helpBodyBold}>9am to 1pm on weekends,</Text>
                    {' excluding bank holidays.'}
                  </Text>
                  <Text style={styles.helpBody}>You can call us or get in touch via email. Don{'\u2019'}t send any personal medical info via email. Drop us a note and we{'\u2019'}ll arrange a confidential call.</Text>
                </View>
                <View style={styles.contactButtons}>
                  <View
                    style={[styles.secondaryButton, hoveredBtn === 'email' && styles.secondaryButtonHover, pressedBtn === 'email' && styles.secondaryButtonPressed]}
                    onMouseEnter={() => setHoveredBtn('email')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onMouseDown={() => setPressedBtn('email')}
                    onMouseUp={() => setPressedBtn(null)}
                  >
                    <Image
                      source={require('../theme/icons/email.svg')}
                      style={styles.secondaryButtonIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.secondaryButtonText}>Email us</Text>
                  </View>
                  <View
                    style={[styles.secondaryButton, hoveredBtn === 'call' && styles.secondaryButtonHover, pressedBtn === 'call' && styles.secondaryButtonPressed]}
                    onMouseEnter={() => setHoveredBtn('call')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onMouseDown={() => setPressedBtn('call')}
                    onMouseUp={() => setPressedBtn(null)}
                  >
                    <Image
                      source={require('../theme/icons/call.svg')}
                      style={styles.secondaryButtonIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.secondaryButtonText}>Call us</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: pippTheme.colors.background.primary,
  } as any,
  safeArea: {
    flex: 1,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  } as any,
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
    backgroundColor: pippTheme.colors.background.primary,
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.04)',
  } as any,
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerLogo: {
    height: 22,
    width: 110,
  },
  headerSpacer: {
    flex: 1,
  },
  headerMenuIcon: {
    width: 24,
    height: 24,
    tintColor: '#086A74',
  },
  mainContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  } as any,
  popperImage: {
    width: 80,
    height: 80,
    flexShrink: 0,
  },
  textGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  } as any,
  heading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    color: '#07073D',
    textAlign: 'center',
  } as any,
  emailGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  bodyText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#2F345F',
    textAlign: 'center',
  } as any,
  emailText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#2F345F',
    textAlign: 'center',
  } as any,
  reviewBanner: {
    paddingVertical: 8,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  } as any,

  // Upload card
  uploadCard: {
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  } as any,
  badgePill: {
    paddingVertical: 2,
    paddingLeft: 4,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: 360,
    backgroundColor: '#B8F4DA',
    flexDirection: 'row',
  } as any,
  badgePillIcon: {
    width: 16,
    height: 16,
    aspectRatio: 1,
    tintColor: '#07073D',
  } as any,
  badgePillText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    color: '#07073D',
  } as any,
  uploadHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#07073D',
  } as any,
  uploadBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  uploadBodyBold: {
    fontWeight: '600',
  } as any,
  bulletList: {
    paddingHorizontal: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  bulletText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  infoBox: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 4,
    backgroundColor: '#E9EEFA',
  } as any,
  infoIcon: {
    width: 20,
    height: 20,
    aspectRatio: 1,
    tintColor: '#003D88',
  } as any,
  infoText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  infoTextBold: {
    fontWeight: '600',
  } as any,
  // Order details card
  orderCard: {
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    gap: 16,
  } as any,
  orderCardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  orderCardHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#07073D',
  } as any,
  orderCardNumber: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#086A74',
  } as any,
  orderCardDivider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#DEE6E1',
  } as any,
  orderCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  } as any,
  orderCardIcon: {
    width: 20,
    height: 20,
    tintColor: '#E6E7ED',
  } as any,
  orderCardInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  } as any,
  orderCardLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#07073D',
    alignSelf: 'flex-start',
  } as any,
  orderCardDeliveryInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  } as any,
  orderCardDeliverySection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: 4,
  } as any,
  orderCardText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
    alignSelf: 'flex-start',
  } as any,
  orderCardPaymentInfo: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  } as any,
  paymentLines: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  paymentLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  } as any,
  paymentDividerWrap: {
    alignSelf: 'stretch',
    paddingVertical: 4,
  } as any,
  paymentPaidRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  paymentGPayIcon: {
    width: 24,
    height: 24,
  } as any,
  orderCardTreatment: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
    alignSelf: 'flex-start',
  } as any,
  orderCardTreatmentSubtle: {
    color: '#575D84',
  } as any,
  // Track your progress card
  trackCard: {
    padding: 24,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundImage: 'linear-gradient(291deg, #FDFAF7 0%, #DEF4F7 100%)',
  } as any,
  trackImage: {
    width: 174,
    height: 162,
  } as any,
  trackHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  trackHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#000000',
  } as any,
  trackBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#000000',
  } as any,
  newBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    backgroundColor: '#086A74',
  } as any,
  newBadgeText: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  } as any,
  // Help card
  helpCard: {
    padding: 24,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    backgroundColor: '#FFFFFF',
  } as any,
  helpImageWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    paddingVertical: 20,
  } as any,
  helpImage: {
    width: 240,
    height: 138,
  } as any,
  helpTextGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  } as any,
  helpHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#07073D',
  } as any,
  helpBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  helpBodyBold: {
    fontWeight: '600',
  } as any,
  helpButtons: {
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  secondaryButton: {
    height: 48,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#07073D',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  } as any,
  secondaryButtonHover: {
    backgroundColor: '#DEF4F7',
  } as any,
  secondaryButtonPressed: {
    backgroundColor: '#AEE5EB',
  } as any,
  secondaryButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16,
    color: '#07073D',
    textAlign: 'center',
  } as any,
  secondaryButtonIcon: {
    width: 16,
    height: 16,
    tintColor: '#07073D',
  } as any,
  helpDivider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#D2D2D2',
  } as any,
  helpContactSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    alignSelf: 'stretch',
  } as any,
  contactButtons: {
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  helpContactTextGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  } as any,
  moreInfoButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
  } as any,
  moreInfoText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#086A74',
  } as any,
  moreInfoIcon: {
    width: 16,
    height: 16,
    tintColor: '#086A74',
  } as any,
  linkButton: {
    height: 48,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 4,
    flexDirection: 'row',
  } as any,
  linkButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#086A74',
    textAlign: 'center',
    textDecorationLine: 'underline',
  } as any,
  linkButtonIcon: {
    width: 16,
    height: 16,
    tintColor: '#086A74',
  } as any,

  // Upload page styles
  uploadHeader: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
    backgroundColor: pippTheme.colors.background.primary,
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.04)',
  } as any,
  uploadHeaderRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  } as any,
  uploadBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  uploadBackIcon: {
    width: 24,
    height: 24,
    tintColor: '#086A74',
  } as any,
  uploadBackPlaceholder: {
    width: 40,
    height: 40,
  } as any,
  uploadScrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  } as any,
  uploadMainContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  } as any,
  uploadHeaderGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  uploadHeadingLarge: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
  } as any,
  uploadSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  uploadSecurityBox: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 4,
    backgroundColor: '#E9EEFA',
  } as any,
  uploadSecurityIcon: {
    width: 20,
    height: 20,
  } as any,
  uploadSecurityTextGroup: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  } as any,
  uploadSecurityTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  uploadSecurityBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    color: '#07073D',
  } as any,
  uploadSecurityBodyBold: {
    fontWeight: '700',
  } as any,
  uploadDivider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#DEE6E1',
  } as any,

  // Photo ID section
  photoIdSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  photoIdHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#07073D',
  } as any,
  photoIdBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  photoIdBodyBold: {
    fontWeight: '700',
  } as any,
  photoIdExamplesWrap: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  } as any,
  photoIdExamplesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  photoIdExampleImage: {
    flex: 1,
    aspectRatio: 803 / 452,
    borderRadius: 3,
  } as any,
  acceptedIdList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  acceptedIdLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    color: '#07073D',
  } as any,
  acceptedIdRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'stretch',
  } as any,
  acceptedIdIcon: {
    width: 16,
    height: 16,
    tintColor: '#007D42',
  } as any,
  acceptedIdText: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 20,
    color: '#07073D',
  } as any,
  uploadDropzone: {
    padding: 20,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23E6E7ED' stroke-width='1' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
  } as any,
  weightEvidenceSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  } as any,
  weightSubsection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  weightSubsectionTitle: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  weightContentRow: {
    paddingLeft: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  } as any,
  weightSubcopyWrap: {
    paddingLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
    marginTop: -8,
  } as any,
  weightPlaceholderImage: {
    width: 106,
    height: 141,
    borderRadius: 4,
    backgroundColor: '#E6E7ED',
  } as any,
  weightImgTag: {
    width: '30%',
    aspectRatio: '106 / 141',
    objectFit: 'cover',
    objectPosition: 'top',
    borderRadius: 4,
    flexShrink: 0,
  } as any,
  notAcceptedLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    color: '#07073D',
    marginTop: 8,
  } as any,
  notAcceptedIcon: {
    width: 16,
    height: 16,
    tintColor: '#BB292A',
  } as any,
  // QR Code Modal styles
  qrOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  } as any,
  qrOverlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
  } as any,
  qrOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: 'pointer',
  } as any,
  qrModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
  } as any,
  qrModalInner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  } as any,
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as any,
  qrModalHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
    flex: 1,
  } as any,
  qrCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  qrCloseIcon: {
    width: 24,
    height: 24,
    tintColor: '#07073D',
  } as any,
  qrCodeSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  } as any,
  qrCodeWrapper: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E7ED',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,
  qrInstructionText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#2F345F',
    textAlign: 'center',
  } as any,
  qrDivider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#DEE6E1',
  } as any,
  qrWaitingSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  } as any,
  qrWaitingText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  qrWaitingSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#575D84',
    textAlign: 'center',
  } as any,
  qrReceivedIcon: {
    width: 32,
    height: 32,
    tintColor: '#007D42',
  } as any,
  qrReceivedThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    objectFit: 'cover',
  } as any,
  // Captured photo success state
  capturedDropzone: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F0FAF4',
    borderWidth: 1,
    borderColor: '#007D42',
  } as any,
  capturedThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 6,
    objectFit: 'cover',
    flexShrink: 0,
  } as any,
  capturedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  } as any,
  capturedCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as any,
  capturedCheckIcon: {
    width: 18,
    height: 18,
    tintColor: '#007D42',
  } as any,
  capturedText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: '#007D42',
  } as any,
  retakeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#07073D',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    cursor: 'pointer',
  } as any,
  retakeButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: '#07073D',
  } as any,
  // Camera page styles
  cameraPageContent: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    minHeight: 'calc(100vh - 56px)',
  } as any,
  cameraPageCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  cameraPageFooter: {
    paddingVertical: 16,
    paddingBottom: 32,
    alignSelf: 'stretch',
  } as any,
  cameraStateContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    maxWidth: 320,
  } as any,
  cameraStateHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
    textAlign: 'center',
  } as any,
  cameraStateSubtext: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#575D84',
    textAlign: 'center',
  } as any,
  cameraSuccessIcon: {
    width: 48,
    height: 48,
    tintColor: '#007D42',
  } as any,
  uploadBottomSpacer: {
    height: 16,
  } as any,
  warningBanner: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
    backgroundColor: '#FEF3E0',
    padding: 16,
    borderRadius: 8,
  } as any,
  warningBannerText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
  } as any,
  warningBannerBold: {
    fontWeight: '600',
  } as any,
  // Submit confirmation modal styles
  submitModalHeading: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: '#07073D',
    flex: 1,
  } as any,
  submitModalBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#07073D',
    alignSelf: 'stretch',
  } as any,
  submitChecklistCard: {
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23E6E7ED' stroke-width='1' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
  } as any,
  submitChecklistLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#2F345F',
    alignSelf: 'flex-start',
  } as any,
  submitChecklistItems: {
    flexDirection: 'column',
    gap: 8,
    alignSelf: 'stretch',
  } as any,
  submitChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as any,
  submitChecklistIcon: {
    width: 20,
    height: 20,
  } as any,
  submitChecklistIconGreen: {
    tintColor: '#007D42',
  } as any,
  submitChecklistIconRed: {
    tintColor: '#BB292A',
  } as any,
  submitChecklistText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  submitInfoBanner: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 4,
    backgroundColor: '#E9EEFA',
  } as any,
  submitInfoIcon: {
    width: 20,
    height: 20,
    tintColor: '#003D88',
    flexShrink: 0,
  } as any,
  submitInfoTextWrap: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  } as any,
  submitInfoHeading: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  submitInfoBody: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: '#07073D',
  } as any,
  submitButtonsWrap: {
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'stretch',
  } as any,
  submitGoBackButton: {
    height: 48,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#07073D',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    cursor: 'pointer',
  } as any,
  submitGoBackIcon: {
    width: 16,
    height: 16,
    tintColor: '#07073D',
  } as any,

  // Custom in-app camera styles
  cameraOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    backgroundColor: '#000000',
  } as any,
  cameraTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    zIndex: 10,
  } as any,
  cameraTopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  cameraTopIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  } as any,
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  } as any,
  countdownText: {
    fontFamily: pippTheme.fontFamily.heading,
    fontSize: 96,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  } as any,
  cameraBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 48,
    zIndex: 10,
  } as any,
  timerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  } as any,
  timerButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  timerButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  } as any,
  timerButtonText: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  } as any,
  timerButtonTextActive: {
    color: '#07073D',
  } as any,
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 20,
  } as any,
  zoomLabel: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 24,
    textAlign: 'center',
  } as any,
  captureButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  } as any,
  reviewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 48,
    zIndex: 10,
  } as any,
  reviewButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  } as any,
  reviewRetakeButton: {
    flex: 1,
    height: 50,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  } as any,
  reviewRetakeText: {
    fontFamily: pippTheme.fontFamily.button,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  } as any,
  reviewUseButtonWrap: {
    flex: 1,
  } as any,
});

export default PhotoCaptureScreen;
