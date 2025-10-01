import React, { useState, useEffect, useMemo } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Alert,
    TextInput,
    Modal,
    Linking,
    StatusBar,
    ImageBackground,
    Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import type {
    ImagePickerResponse,
    MediaType,
    ImageLibraryOptions,
    CameraOptions
} from 'react-native-image-picker';

// ✅ Add translation context
import { useTranslation } from '../../context/TranslationContext';

// Assets
import bg2 from '../../assets/images/bg2.png';
import { icons } from '../../constants/index';
import profilephoto from '../../assets/images/profilephoto.png';
import taskicon from '../../assets/images/taskicon.gif';
import howtodoit from '../../assets/images/howtodoiticon.gif';
import VerificationModal from '../../components/VerficationModal';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Navigation types
type NavigationProp = any;
type RouteProp = any;

// Type definitions
interface AssignedUser {
    id: string;
    username: string;
    email: string;
    task_status: string | null;
}

interface ApiTask {
    task_id?: string;
    id: string;
    task_name: string;
    task_description: string;
    task_reward: string;
    task_status: string;
    task_starttime: string;
    task_endtime: string;
    created_at: string;
    status: string;
    documents: string | null;
    hashtag: string | null;
    tag: string | null;
    assigned_users: AssignedUser[];
}

interface ApiResponse {
    status: string;
    message: string;
    data: ApiTask[];
}

interface SubmissionResponse {
    status: string;
    message: string;
    data: {
        submission_id: number;
        task_id: number;
        user_id: number;
        task_image: string;
        task_url: string;
        task_status: string;
    };
}




const TaskDetails = () => {
    // Get navigation and route
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp>();

    // Get taskId from route params
    const taskId = route.params?.taskId;

    // State management
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [taskDetail, setTaskDetail] = useState<ApiTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [taskUrl, setTaskUrl] = useState('');
    const [taskImage, setTaskImage] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    // inside your component, add these hooks near the top
    const { currentLanguage } = useTranslation();   // <-- from your TranslationContext
    const isHi = currentLanguage === 'hi';

    // Get user ID from context
    const { getUserId } = useUser();
    const USER_ID = getUserId();

    // User-specific task status
    const getUserTaskStatus = useMemo(() => {
        if (!taskDetail || !taskDetail.assigned_users || !USER_ID) return null;
        const currentUser = taskDetail.assigned_users.find(
            user => String(user.id) === String(USER_ID)
        );
        return currentUser?.task_status || null;
    }, [taskDetail, USER_ID]);

    // Fetch task details by ID
    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!USER_ID) {
                setError(isHi ? 'उपयोगकर्ता लॉगिन नहीं है। कृपया दोबारा लॉगिन करें।'
                    : 'User not logged in. Please login again.');
                return;
            }

            if (!taskId) {
                setError(isHi ? 'टास्क आईडी उपलब्ध नहीं है।'
                    : 'Task ID not provided.');
                return;
            }

            const response = await fetch(
                'https://miragiofintech.org/api/api.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'get_tasks' })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.status === 'success' && data.data) {
                const foundTask = data.data.find(
                    task => String(task.id) === String(taskId) || String(task.task_id) === String(taskId)
                );

                if (foundTask) {
                    const isUserAssigned = foundTask.assigned_users.some(
                        user => String(user.id) === String(USER_ID)
                    );
                    if (isUserAssigned) {
                        setTaskDetail(foundTask);
                    } else {
                        setError(isHi ? 'आप इस कार्य के लिए असाइन नहीं हैं।'
                            : 'You are not assigned to this task');
                    }
                } else {
                    setError(isHi ? 'कार्य नहीं मिला।'
                        : 'Task not found');
                }
            } else {
                setError(data.message || (isHi ? 'कार्य विवरण लोड करने में असफल।'
                    : 'Failed to fetch task details'));
            }
        } catch (err) {
            console.error('Error fetching task details:', err);
            setError(isHi ? 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जाँचें।'
                : 'Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Check if downloadable content exists
    const hasDownloadableContent = useMemo(() => {
        if (!taskDetail) return false;
        const docs = taskDetail.documents?.trim() || '';
        return docs && docs.toLowerCase() !== 'null';
    }, [taskDetail]);

    // Download handler with translations
    const downloadTaskFile = async () => {
        try {
            setIsDownloading(true);

            if (!taskDetail) {
                Alert.alert(isHi ? 'त्रुटि' : 'Error',
                    isHi ? 'कार्य विवरण उपलब्ध नहीं है।' : 'Task details not available');
                return;
            }

            if (!hasDownloadableContent) {
                Alert.alert(isHi ? 'डाउनलोड उपलब्ध नहीं' : 'No Download Available',
                    isHi ? 'इस कार्य के लिए कोई डाउनलोड करने योग्य सामग्री नहीं है।'
                        : 'This task does not have any downloadable materials.');
                return;
            }

            let downloadUrl = taskDetail.documents!.trim();
            if (!downloadUrl.startsWith('http')) {
                downloadUrl = `https://miragiofintech.org/api/${downloadUrl}`;
            }

            const supported = await Linking.canOpenURL(downloadUrl);
            if (supported) {
                Alert.alert(
                    isHi ? 'दस्तावेज़ डाउनलोड' : 'Download Document',
                    isHi
                        ? `क्या आप कार्य दस्तावेज़ डाउनलोड करना चाहते हैं?\n\nफ़ाइल: ${getDownloadFileType()}`
                        : `Do you want to download the task document?\n\nFile: ${getDownloadFileType()}`,
                    [
                        { text: isHi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
                        {
                            text: isHi ? 'डाउनलोड' : 'Download',
                            onPress: async () => {
                                try {
                                    await Linking.openURL(downloadUrl);
                                    Alert.alert(
                                        isHi ? 'डाउनलोड प्रारंभ' : 'Download Started',
                                        isHi
                                            ? 'दस्तावेज़ का डाउनलोड आपके ब्राउज़र में शुरू हो गया है।'
                                            : 'The document download has been initiated in your browser.'
                                    );
                                } catch (e) {
                                    console.error('Download error:', e);
                                    Alert.alert(
                                        isHi ? 'डाउनलोड विफल' : 'Download Failed',
                                        isHi
                                            ? 'डाउनलोड लिंक खोलने में असफल। कृपया पुनः प्रयास करें।'
                                            : 'Failed to open the download link. Please try again.'
                                    );
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(isHi ? 'त्रुटि' : 'Error',
                    isHi
                        ? 'डाउनलोड लिंक नहीं खोला जा सका। कृपया जांचें कि ब्राउज़र स्थापित है।'
                        : 'Unable to open the download link. Please check if you have a browser installed.');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert(
                isHi ? 'डाउनलोड विफल' : 'Download Failed',
                isHi
                    ? 'डाउनलोड प्रक्रिया विफल हुई। कृपया पुनः प्रयास करें।'
                    : 'Failed to process the download. Please try again.'
            );
        } finally {
            setIsDownloading(false);
        }
    };

    // Updated function to get download file type for display
    const getDownloadFileType = () => {
        if (!taskDetail || !taskDetail.documents) return isHi ? 'दस्तावेज़' : 'Document';

        const url = taskDetail.documents.toLowerCase();

        if (url.includes('.pdf')) return isHi ? 'PDF दस्तावेज़' : 'PDF Document';
        if (url.includes('.doc') || url.includes('.docx')) return isHi ? 'वर्ड दस्तावेज़' : 'Word Document';
        if (url.includes('.xls') || url.includes('.xlsx')) return isHi ? 'एक्सेल दस्तावेज़' : 'Excel Document';
        if (url.includes('.ppt') || url.includes('.pptx')) return isHi ? 'पावरपॉइंट' : 'PowerPoint';
        if (url.includes('.zip') || url.includes('.rar')) return isHi ? 'आर्काइव फ़ाइल' : 'Archive File';
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif'))
            return isHi ? 'चित्र फ़ाइल' : 'Image File';
        if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov'))
            return isHi ? 'वीडियो फ़ाइल' : 'Video File';
        if (url.includes('.mp3') || url.includes('.wav'))
            return isHi ? 'ऑडियो फ़ाइल' : 'Audio File';
        if (url.includes('.txt')) return isHi ? 'पाठ फ़ाइल' : 'Text File';

        return isHi ? 'दस्तावेज़' : 'Document';
    };

    const submitTask = async () => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);

            if (!USER_ID || !taskId) {
                setSubmitError(
                    isHi ? 'उपयोगकर्ता या कार्य जानकारी गायब है' : 'Missing user or task information'
                );
                return;
            }

            if (!taskUrl || !taskImage) {
                setSubmitError(
                    isHi
                        ? 'कृपया कार्य पूरा करने से पहले URL जोड़ें और एक छवि अपलोड करें'
                        : 'Please provide BOTH a URL and an image before submitting the task'
                );
                return;
            }

            // Create FormData for proper file upload
            const formData = new FormData();
            formData.append('action', 'add_submission');
            formData.append('task_id', String(taskId));
            formData.append('user_id', String(USER_ID));
            formData.append('task_url', taskUrl || '');

            if (taskImage) {
                const extension = selectedImageName.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = `${Date.now()}_${selectedImageName}`;
                const mimeType =
                    extension === 'png'
                        ? 'image/png'
                        : extension === 'jpg' || extension === 'jpeg'
                            ? 'image/jpeg'
                            : 'application/octet-stream';

                formData.append('task_image', {
                    uri: taskImage.startsWith('file://') ? taskImage : `file://${taskImage}`,
                    type: mimeType,
                    name: fileName,
                } as any);
            }

            const response = await fetch(
                'https://miragiofintech.org/api/api.php',
                {
                    method: 'POST',
                    headers: {
                        // Do not set Content-Type manually for FormData
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('Server response:', responseText);

            let data: SubmissionResponse;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Response text:', responseText);
                throw new Error(isHi ? 'सर्वर से अमान्य JSON उत्तर' : 'Invalid JSON response from server');
            }

            if (data.status === 'success') {
                console.log('Upload successful:', data.data);

                // Refresh task details to get updated status
                await fetchTaskDetails();

                // Clear form data
                setTaskUrl('');
                setTaskImage('');
                setSelectedImageName('');

                // Open verification modal
                setIsModalVisible(true);
            } else {
                setSubmitError(
                    data.message || (isHi ? 'कार्य सबमिट करने में विफल' : 'Failed to submit task')
                );
                console.error('Server error:', data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error submitting task:', err);
            setSubmitError(
                isHi
                    ? `अपलोड विफल: ${errorMessage}`
                    : `Upload failed: ${errorMessage}`
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    // Updated image picker to handle file info properly
    const pickImage = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            includeExtra: true,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                if (response.errorMessage) {
                    Alert.alert(isHi ? 'त्रुटि' : 'Error', response.errorMessage);
                }
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                if (asset.uri) {
                    setTaskImage(asset.uri);
                    setSelectedImageName(asset.fileName || `image_${Date.now()}.jpg`);
                    Alert.alert(isHi ? 'सफलता' : 'Success',
                        isHi ? 'छवि सफलतापूर्वक चुनी गई!' : 'Image selected successfully!');
                } else {
                    Alert.alert(isHi ? 'त्रुटि' : 'Error',
                        isHi ? 'छवि चुनने में विफल। कृपया पुनः प्रयास करें।'
                            : 'Failed to select image. Please try again.');
                }
            }
        });
    };

    // Updated camera function
    const openCamera = () => {
        const options: CameraOptions = {
            mediaType: 'photo' as MediaType,
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            includeExtra: true,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                if (response.errorMessage) {
                    Alert.alert(isHi ? 'त्रुटि' : 'Error', response.errorMessage);
                }
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                if (asset.uri) {
                    setTaskImage(asset.uri);
                    setSelectedImageName(asset.fileName || `photo_${Date.now()}.jpg`);
                    Alert.alert(isHi ? 'सफलता' : 'Success',
                        isHi ? 'फोटो सफलतापूर्वक कैप्चर हुआ!' : 'Photo captured successfully!');
                } else {
                    Alert.alert(isHi ? 'त्रुटि' : 'Error',
                        isHi ? 'फोटो कैप्चर करने में विफल। कृपया पुनः प्रयास करें।'
                            : 'Failed to capture photo. Please try again.');
                }
            }
        });
    };

    // Show camera/gallery options
    const showImagePickerOptions = () => {
        Alert.alert(
            isHi ? 'छवि चुनें' : 'Select Image',
            isHi ? 'एक विकल्प चुनें' : 'Choose an option',
            [
                { text: isHi ? 'कैमरा' : 'Camera', onPress: () => openCamera() },
                { text: isHi ? 'गैलरी' : 'Gallery', onPress: () => pickImage() },
                { text: isHi ? 'रद्द करें' : 'Cancel', style: 'cancel' }
            ]
        );
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(isHi ? 'hi-IN' : 'en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Load task details on component mount
    useEffect(() => {
        fetchTaskDetails();
    }, [taskId, USER_ID]);

    // Handler to mark task as complete
    const handleMarkComplete = () => {
        if (!taskUrl || !taskImage) {
            setSubmitError(
                isHi
                    ? 'कृपया कार्य पूरा करने से पहले URL जोड़ें और एक छवि अपलोड करें'
                    : 'Please provide BOTH a URL and an image before marking as complete'
            );
            return;
        }

        setSubmitError(null);
        submitTask();
    };


    // Handler to close verification modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
        navigation.goBack();
    };

    // Handler for modal action
    const handleBackToTask = () => {
        setIsModalVisible(false);
        navigation.goBack();
    };

    // Navigation handlers
    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleProfilePress = () => {
        navigation.navigate('UserProfile', { from: 'task/taskdetails' });
    };

    const handleInstructionsPress = () => {
        navigation.navigate('Instructions', { taskId: taskId });
    };

    // Check if task can be submitted based on user's task status
    const canSubmitTask = useMemo(() => {
        const userStatus = getUserTaskStatus?.toLowerCase();
        // Users can submit only if: no status or any status except approved, pending, and rejected
        return !userStatus || (userStatus !== 'approved' && userStatus !== 'pending' && userStatus !== 'rejected');
    }, [getUserTaskStatus]);

    // Get display status for UI
    const getDisplayStatus = () => {
        const userStatus = getUserTaskStatus;
        if (!userStatus) return 'Not Started';

        switch (userStatus.toLowerCase()) {
            case 'approved': return 'Completed';
            case 'pending': return 'Pending Review';
            case 'rejected': return 'Rejected';
            default: return userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
        }
    };

    // Loading state
    if (loading) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: Colors.light.whiteFefefe, fontSize: width * 0.05 }}>
                        {isHi ? 'कार्य विवरण लोड हो रहा है...' : 'Loading task details...'}
                    </Text>
                </View>
            </View>
        );
    }

    // Error state
    if (error || !taskDetail) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: width * 0.04 }}>
                    <Text
                        style={{
                            color: Colors.light.placeholderColorOp70,
                            fontSize: width * 0.05,
                            marginBottom: height * 0.02
                        }}
                        className="text-center"
                    >
                        {error || (isHi ? 'कार्य नहीं मिला' : 'Task not found')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={{
                            backgroundColor: Colors.light.bgBlueBtn,
                            paddingHorizontal: width * 0.06,
                            paddingVertical: height * 0.015,
                            borderRadius: 8
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.04
                            }}
                            className="font-semibold"
                        >
                            {isHi ? 'वापस जाएं' : 'Go Back'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    return (
        <View className="flex-1" style={{ backgroundColor: Colors.light.blackPrimary }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* =================== HEADER WITH BACKGROUND IMAGE =================== */}
            <View style={{ height: height * 0.14 }}>
                <ImageBackground
                    source={bg2}
                    resizeMode="cover"
                    className="w-full h-full absolute"
                />
                <View
                    className="flex-1"
                    style={{
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.02,
                        paddingHorizontal: width * 0.04
                    }}
                >
                    <View
                        className="flex-row items-center justify-between"
                        style={{ height: height * 0.08 }}
                    >
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={handleBackPress}
                            style={{
                                width: width * 0.1,
                                height: width * 0.1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Image
                                source={icons.back}
                                style={{
                                    width: width * 0.04,
                                    height: width * 0.06
                                }}
                            />
                        </TouchableOpacity>

                        {/* Centered title with translation */}
                        <View className="flex-1 items-center">
                            <Text
                                style={{
                                    color: Colors.light.whiteFfffff,
                                    fontSize: width * 0.075
                                }}
                                className="font-medium"
                            >
                                {isHi ? 'कार्य विवरण' : 'Task Details'}
                            </Text>
                        </View>

                        {/* Profile photo */}
                        <TouchableOpacity
                            onPress={handleProfilePress}
                            style={{
                                backgroundColor: Colors.light.whiteFfffff,
                                width: width * 0.1,
                                height: width * 0.1,
                                borderRadius: (width * 0.1) / 2
                            }}
                            className="items-center justify-center"
                        >
                            <Image
                                source={profilephoto}
                                style={{
                                    height: width * 0.1,
                                    width: width * 0.1,
                                    borderRadius: (width * 0.1) / 2
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Header border line */}
                <View
                    className="absolute bottom-0 w-full"
                    style={{
                        backgroundColor: Colors.light.whiteFfffff,
                        height: 1
                    }}
                />
            </View>

            {/* =================== SCROLLABLE CONTENT SECTION =================== */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: height * 0.12,
                    paddingHorizontal: width * 0.04
                }}
            >
                {/* =================== TASK TITLE SECTION =================== */}
                <View
                    className="flex-row items-center"
                    style={{ paddingVertical: height * 0.025 }}
                >
                    <Image
                        source={taskicon}
                        style={{ width: width * 0.1, height: width * 0.1 }}
                    />
                    <Text
                        style={{
                            color: Colors.light.whiteFefefe,
                            fontSize: width * 0.055,
                            paddingLeft: width * 0.04,
                        }}
                        className="font-semibold flex-1"
                    >
                        {/* Always show English task name from API */}
                        {taskDetail.task_name}
                    </Text>
                </View>

                {/* =================== TASK DESCRIPTION SECTION =================== */}
                <View style={{ marginBottom: height * 0.02 }}>
                    <Text
                        style={{
                            color: Colors.light.placeholderColorOp70,
                            fontSize: width * 0.04,
                            lineHeight: width * 0.06,
                        }}
                    >
                        {taskDetail.task_description}
                    </Text>
                </View>
                {/* =================== HASHTAGS SECTION =================== */}
                {taskDetail.hashtag &&
                    taskDetail.hashtag.trim() &&
                    taskDetail.hashtag.toLowerCase() !== 'null' && (
                        <View style={{ paddingVertical: height * 0.02 }}>
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.045,
                                    marginBottom: height * 0.015,
                                }}
                                className="font-semibold"
                            >
                                {currentLanguage === 'hi' ? 'हैशटैग इस्तेमाल करें' : 'Hashtags to Use'}
                            </Text>

                            <View className="flex-row flex-wrap">
                                {taskDetail.hashtag
                                    .split(/[\s,]+/)          // split on spaces or commas
                                    .filter(tag => tag.startsWith('#'))
                                    .map((hashtag, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                backgroundColor: Colors.light.backlight2,
                                                borderColor: Colors.light.bgBlueBtn,
                                                borderWidth: 1,
                                                borderRadius: 15,
                                                paddingHorizontal: width * 0.03,
                                                paddingVertical: height * 0.005,
                                                marginRight: width * 0.02,
                                                marginBottom: height * 0.01,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: Colors.light.bgBlueBtn,
                                                    fontSize: width * 0.035,
                                                }}
                                                className="font-medium"
                                            >
                                                {hashtag}
                                            </Text>
                                        </View>
                                    ))}
                            </View>

                            <Text
                                style={{
                                    color: Colors.light.placeholderColorOp70,
                                    fontSize: width * 0.035,
                                    marginTop: height * 0.01,
                                }}
                            >
                                {currentLanguage === 'hi'
                                    ? 'पोस्ट करते समय इन हैशटैग का उपयोग करें'
                                    : 'Copy and use these hashtags when posting about this task'}
                            </Text>
                        </View>
                    )}

                {/* =================== TASK TAG CARD (if available) =================== */}
                {taskDetail.tag && taskDetail.tag.trim() && taskDetail.tag.toLowerCase() !== 'null' && (
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                        }}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View className="items-center justify-center" style={{ marginRight: width * 0.03 }}>
                                <Image
                                    source={icons.assignicon}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {currentLanguage === 'hi' ? 'कार्य टैग' : 'Task Tag'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {taskDetail.tag}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}


                {/* =================== TASK DETAILS CARDS SECTION =================== */}
                <View style={{ paddingVertical: height * 0.025 }}>
                    {/* =================== DUE DATE CARD =================== */}
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                        }}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View className="items-center justify-center" style={{ marginRight: width * 0.03 }}>
                                <Image
                                    source={icons.duedateicon}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {currentLanguage === 'hi' ? 'अंतिम तिथि' : 'Due Date'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {formatDate(taskDetail.task_endtime)}
                                </Text>
                            </View>

                            <View className="items-center justify-center">
                                <Image
                                    source={icons.duecheckicon}
                                    style={{ height: width * 0.09, width: width * 0.09 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* =================== TASK STATUS CARD =================== */}
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                        }}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View className="items-center justify-center" style={{ marginRight: width * 0.03 }}>
                                <Image
                                    source={icons.assignicon}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {currentLanguage === 'hi' ? 'कार्य स्थिति' : 'Task Status'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {getDisplayStatus()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* =================== REWARD CARD =================== */}
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                        }}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View className="items-center justify-center" style={{ marginRight: width * 0.03 }}>
                                <Image
                                    source={icons.maincoin}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {currentLanguage === 'hi' ? 'इनाम' : 'Reward'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {taskDetail.task_reward} {currentLanguage === 'hi' ? 'कॉइन्स' : 'coins'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* =================== DOWNLOAD MATERIALS CARD =================== */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: hasDownloadableContent
                                ? Colors.light.bgGreen
                                : Colors.light.placeholderColorOp70,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                            opacity: isDownloading ? 0.7 : hasDownloadableContent ? 1 : 0.6,
                        }}
                        onPress={hasDownloadableContent ? downloadTaskFile : undefined}
                        disabled={isDownloading || !hasDownloadableContent}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View
                                className="items-center justify-center"
                                style={{ marginRight: width * 0.03 }}
                            >
                                <Image
                                    source={icons.download}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: hasDownloadableContent
                                            ? Colors.light.whiteFefefe
                                            : Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {isDownloading
                                        ? currentLanguage === 'hi'
                                            ? 'डाउनलोड हो रहा है...'
                                            : 'Downloading...'
                                        : hasDownloadableContent
                                            ? currentLanguage === 'hi'
                                                ? 'सामग्री डाउनलोड करें'
                                                : 'Download Materials'
                                            : currentLanguage === 'hi'
                                                ? 'कोई सामग्री उपलब्ध नहीं'
                                                : 'No Materials Available'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {isDownloading
                                        ? currentLanguage === 'hi'
                                            ? 'कृपया प्रतीक्षा करें...'
                                            : 'Please wait...'
                                        : hasDownloadableContent
                                            ? currentLanguage === 'hi'
                                                ? `डाउनलोड करें ${getDownloadFileType().toLowerCase()}`
                                                : `Download ${getDownloadFileType().toLowerCase()}`
                                            : currentLanguage === 'hi'
                                                ? 'इस कार्य के लिए कोई डाउनलोड योग्य सामग्री नहीं है'
                                                : 'No downloadable materials for this task'}
                                </Text>
                            </View>

                            {hasDownloadableContent && (
                                <View className="items-center justify-center">
                                    <Image
                                        source={icons.go}
                                        style={{
                                            width: width * 0.03,
                                            height: width * 0.03,
                                            opacity: isDownloading ? 0.5 : 1,
                                            tintColor: Colors.light.bgGreen,
                                        }}
                                    />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* =================== UPLOAD SECTION =================== */}
                    {canSubmitTask && (
                        <View>
                            {/* Image Preview Section */}
                            {taskImage && (
                                <View
                                    style={{
                                        backgroundColor: Colors.light.backlight2,
                                        borderLeftColor: Colors.light.bgBlueBtn,
                                        borderLeftWidth: 4,
                                        borderRadius: 12,
                                        marginBottom: height * 0.015,
                                        padding: width * 0.03,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFefefe,
                                            fontSize: width * 0.04,
                                            marginBottom: height * 0.01,
                                        }}
                                        className="font-bold"
                                    >
                                        {currentLanguage === 'hi' ? 'चयनित छवि' : 'Selected Image'}
                                    </Text>

                                    <Text
                                        style={{
                                            color: Colors.light.placeholderColorOp70,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                        }}
                                    >
                                        {selectedImageName}
                                    </Text>

                                    <View
                                        style={{
                                            width: '100%',
                                            height: height * 0.25,
                                            borderRadius: 8,
                                            backgroundColor: '#333',
                                            marginBottom: height * 0.01,
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <Image
                                            source={{ uri: taskImage }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setTaskImage('');
                                            setSelectedImageName('');
                                        }}
                                        style={{
                                            backgroundColor: Colors.light.placeholderColorOp70,
                                            paddingHorizontal: width * 0.04,
                                            paddingVertical: height * 0.01,
                                            borderRadius: 8,
                                            alignSelf: 'flex-end',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.035,
                                            }}
                                        >
                                            {currentLanguage === 'hi' ? 'छवि हटाएं' : 'Remove Image'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* URL Preview Section */}
                            {taskUrl && (
                                <View
                                    style={{
                                        backgroundColor: Colors.light.backlight2,
                                        borderLeftColor: Colors.light.bgBlueBtn,
                                        borderLeftWidth: 4,
                                        borderRadius: 12,
                                        marginBottom: height * 0.015,
                                        padding: width * 0.03,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: Colors.light.whiteFefefe,
                                            fontSize: width * 0.04,
                                            marginBottom: height * 0.01,
                                        }}
                                        className="font-bold"
                                    >
                                        {currentLanguage === 'hi' ? 'जोड़ा गया URL' : 'Added URL'}
                                    </Text>
                                    <Text
                                        style={{
                                            color: Colors.light.placeholderColorOp70,
                                            fontSize: width * 0.035,
                                            marginBottom: height * 0.01,
                                        }}
                                    >
                                        {taskUrl}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setTaskUrl('')}
                                        style={{
                                            backgroundColor: Colors.light.placeholderColorOp70,
                                            paddingHorizontal: width * 0.04,
                                            paddingVertical: height * 0.01,
                                            borderRadius: 8,
                                            alignSelf: 'flex-end',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: Colors.light.whiteFefefe,
                                                fontSize: width * 0.035,
                                            }}
                                        >
                                            {currentLanguage === 'hi' ? 'URL हटाएं' : 'Remove URL'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Upload Controls */}
                            <View className="flex-row justify-between" style={{ marginBottom: height * 0.02 }}>
                                {/* Upload photo card */}
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.backlight2,
                                        borderLeftColor: Colors.light.bgBlueBtn,
                                        borderLeftWidth: 4,
                                        borderRadius: 12,
                                        width: '48%',
                                    }}
                                    onPress={showImagePickerOptions}
                                    disabled={isSubmitting}
                                >
                                    <View className="flex-row" style={{ padding: width * 0.03 }}>
                                        <View
                                            className="items-center justify-center"
                                            style={{ marginRight: width * 0.02 }}
                                        >
                                            <Image
                                                source={icons.uploadphoto}
                                                style={{ height: width * 0.075, width: width * 0.075 }}
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View className="flex-1">
                                            <Text
                                                style={{
                                                    color: Colors.light.whiteFefefe,
                                                    fontSize: width * 0.035,
                                                    marginBottom: height * 0.005,
                                                }}
                                                className="font-bold"
                                            >
                                                {currentLanguage === 'hi' ? 'फ़ोटो अपलोड करें' : 'Upload Photo'}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: taskImage
                                                        ? Colors.light.bgGreen
                                                        : Colors.light.placeholderColorOp70,
                                                    fontSize: width * 0.03,
                                                }}
                                            >
                                                {taskImage
                                                    ? currentLanguage === 'hi'
                                                        ? 'फोटो चुनी गई'
                                                        : 'Photo selected'
                                                    : currentLanguage === 'hi'
                                                        ? 'स्क्रीनशॉट जोड़ें'
                                                        : 'add screenshot'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Add URL card */}
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: Colors.light.backlight2,
                                        borderLeftColor: Colors.light.bgBlueBtn,
                                        borderLeftWidth: 4,
                                        borderRadius: 12,
                                        width: '48%',
                                    }}
                                    onPress={() => setShowUrlModal(true)}
                                    disabled={isSubmitting}
                                >
                                    <View className="flex-row" style={{ padding: width * 0.03 }}>
                                        <View
                                            className="items-center justify-center"
                                            style={{ marginRight: width * 0.02 }}
                                        >
                                            <Image
                                                source={icons.addurl}
                                                style={{ height: width * 0.075, width: width * 0.075 }}
                                                resizeMode="contain"
                                            />
                                        </View>

                                        <View className="flex-1">
                                            <Text
                                                style={{
                                                    color: Colors.light.whiteFefefe,
                                                    fontSize: width * 0.035,
                                                    marginBottom: height * 0.005,
                                                }}
                                                className="font-bold"
                                            >
                                                {currentLanguage === 'hi' ? 'यूआरएल जोड़ें' : 'Add Url'}
                                            </Text>
                                            <Text
                                                style={{
                                                    color: taskUrl
                                                        ? Colors.light.bgGreen
                                                        : Colors.light.placeholderColorOp70,
                                                    fontSize: width * 0.03,
                                                }}
                                            >
                                                {taskUrl
                                                    ? currentLanguage === 'hi'
                                                        ? 'URL जोड़ा गया'
                                                        : 'URL added'
                                                    : currentLanguage === 'hi'
                                                        ? 'यूआरएल लिंक जोड़ें'
                                                        : 'Add url link'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}


                    {/* =================== HOW TO DO IT CARD =================== */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            borderLeftColor: Colors.light.bgBlueBtn,
                            borderLeftWidth: 4,
                            borderRadius: 12,
                            marginBottom: height * 0.015,
                        }}
                        onPress={handleInstructionsPress}
                    >
                        <View className="flex-row" style={{ padding: width * 0.03 }}>
                            <View
                                className="items-center justify-center"
                                style={{ marginRight: width * 0.03 }}
                            >
                                <Image
                                    source={howtodoit}
                                    style={{ height: width * 0.08, width: width * 0.08 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View className="flex-1">
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                        marginBottom: height * 0.005,
                                    }}
                                    className="font-bold"
                                >
                                    {currentLanguage === 'hi' ? 'इसे कैसे करें' : 'How to do it'}
                                </Text>
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.035,
                                    }}
                                >
                                    {currentLanguage === 'hi'
                                        ? 'कार्य पूर्ण करने के लिए निर्देश पढ़ें'
                                        : 'Read the instructions to complete tasks'}
                                </Text>
                            </View>

                            <View className="items-center justify-center">
                                <Image
                                    source={icons.go}
                                    style={{ width: width * 0.03, height: width * 0.03 }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* =================== MARK AS COMPLETE BUTTON =================== */}
                    {canSubmitTask && (
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.light.bgGreen,
                                opacity: isSubmitting ? 0.7 : 1,
                                height: height * 0.055,
                                borderRadius: 12,
                                marginBottom: height * 0.015,
                            }}
                            className="items-center justify-center"
                            onPress={handleMarkComplete}
                            disabled={isSubmitting}
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05,
                                }}
                                className="font-semibold"
                            >
                                {isSubmitting
                                    ? currentLanguage === 'hi'
                                        ? 'सबमिट कर रहे हैं...'
                                        : 'Submitting...'
                                    : currentLanguage === 'hi'
                                        ? 'पूरा चिह्नित करें'
                                        : 'Mark As Complete'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {/* =================== STATUS BUTTONS =================== */}
                    {getUserTaskStatus?.toLowerCase() === 'pending' && (
                        <View
                            style={{
                                backgroundColor: '#FFA500',
                                height: height * 0.07,
                                borderRadius: 12,
                                marginBottom: height * 0.015,
                                opacity: 0.8,
                            }}
                            className="items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05,
                                }}
                                className="font-semibold"
                            >
                                {currentLanguage === 'hi' ? '⏳ समीक्षा लंबित' : '⏳ Pending Review'}
                            </Text>
                        </View>
                    )}

                    {getUserTaskStatus?.toLowerCase() === 'approved' && (
                        <View
                            style={{
                                backgroundColor: Colors.light.bgGreen,
                                height: height * 0.07,
                                borderRadius: 12,
                                marginBottom: height * 0.015,
                                opacity: 0.8,
                            }}
                            className="items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05,
                                }}
                                className="font-semibold"
                            >
                                {currentLanguage === 'hi' ? 'कार्य पूर्ण' : 'Task Completed'}
                            </Text>
                        </View>
                    )}

                    {getUserTaskStatus?.toLowerCase() === 'rejected' && (
                        <View
                            style={{
                                backgroundColor: '#ff4444',
                                height: height * 0.07,
                                borderRadius: 12,
                                marginBottom: height * 0.015,
                                opacity: 0.8,
                            }}
                            className="items-center justify-center"
                        >
                            <Text
                                style={{
                                    color: Colors.light.whiteFefefe,
                                    fontSize: width * 0.05,
                                }}
                                className="font-semibold"
                            >
                                {currentLanguage === 'hi' ? 'कार्य अस्वीकृत' : 'Task Rejected'}
                            </Text>
                        </View>
                    )}


                    {/* =================== ERROR MESSAGE =================== */}
                    {submitError && (
                        <View
                            style={{
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                borderColor: '#ff4444',
                                borderWidth: 1,
                                borderRadius: 8,
                                padding: width * 0.03,
                                marginBottom: height * 0.015,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#ff4444',
                                    fontSize: width * 0.035,
                                    textAlign: 'center',
                                }}
                            >
                                {
                                    currentLanguage === 'hi'
                                        ? 'त्रुटि: ' + submitError          // prefix with Hindi label
                                        : submitError                        // English as is
                                }
                            </Text>
                        </View>
                    )}

                </View>
            </ScrollView>

            {/* =================== URL INPUT MODAL =================== */}
            <Modal
                visible={showUrlModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowUrlModal(false)}
            >
                <View
                    className="flex-1 justify-center items-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                >
                    <View
                        style={{
                            backgroundColor: Colors.light.backlight2,
                            width: width * 0.8,
                            borderRadius: 12,
                            padding: width * 0.06,
                        }}
                    >
                        {/* Title */}
                        <Text
                            style={{
                                color: Colors.light.whiteFefefe,
                                fontSize: width * 0.05,
                                marginBottom: height * 0.02,
                            }}
                            className="font-bold"
                        >
                            {currentLanguage === 'hi' ? 'कार्य का URL जोड़ें' : 'Add Task URL'}
                        </Text>

                        {/* Input */}
                        <TextInput
                            style={{
                                backgroundColor: Colors.light.blackPrimary,
                                color: Colors.light.whiteFefefe,
                                borderColor: Colors.light.bgBlueBtn,
                                borderWidth: 2,
                                borderRadius: 8,
                                padding: width * 0.03,
                                marginBottom: height * 0.02,
                                fontSize: width * 0.04,
                            }}
                            placeholder={
                                currentLanguage === 'hi'
                                    ? 'यहाँ URL दर्ज करें...'
                                    : 'Enter URL here...'
                            }
                            placeholderTextColor={Colors.light.placeholderColorOp70}
                            value={taskUrl}
                            onChangeText={setTaskUrl}
                            multiline={false}
                            autoCapitalize="none"
                            keyboardType="url"
                        />

                        {/* Buttons */}
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={() => setShowUrlModal(false)}
                                style={{
                                    paddingHorizontal: width * 0.04,
                                    paddingVertical: height * 0.01,
                                    marginRight: width * 0.03,
                                }}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.placeholderColorOp70,
                                        fontSize: width * 0.04,
                                    }}
                                >
                                    {currentLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: Colors.light.bgBlueBtn,
                                    paddingHorizontal: width * 0.06,
                                    paddingVertical: height * 0.01,
                                    borderRadius: 8,
                                }}
                                onPress={() => setShowUrlModal(false)}
                            >
                                <Text
                                    style={{
                                        color: Colors.light.whiteFefefe,
                                        fontSize: width * 0.04,
                                    }}
                                    className="font-semibold"
                                >
                                    {currentLanguage === 'hi' ? 'सहेजें' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* =================== VERIFICATION MODAL =================== */}
            <VerificationModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onBackToTask={handleBackToTask}
            />
        </View>
    );
};

export default TaskDetails;