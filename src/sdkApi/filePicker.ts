import { FilePickerResult, FilePickerResultType, LocalFile, LocalFileList, OpenFilePickerProps, SDKFileResponse } from "./filePicker.h";
import { v4 as uuidV4 } from "uuid";
import { asyncQueue } from "../asyncQueue";
import { iosMh, isAndroid, isIos } from "../env";
import { logError } from "../errorHandler";

const defaultLang = "en";
// TODO plural and templates for messages
const messages = {
    [defaultLang]: {
        dialog_button_not_now: "Not now",
        dialog_button_settings: "Settings",
        button_no_gallery_access: "Tap to allow access to your Gallery",
        dialog_storage_permission_warning: "You need storage access to load photos and videos. Tap Settings > Permissions and turn 'Files and media' on",
        dialog_photo_permissions_warning: "You need camera access to make photos. Tap Settings > Permissions and turn 'Camera' on",
        dialog_video_permissions_warning:
            "You need camera and microphone access to make videos. Tap Settings > Permissions and turn 'Camera' and 'Microphone' on",
        warns_file_picker_files_limit: "You can select up to 10 files",
        title_storage_permission_warning: "Allow access to your photos and videos",
        title_file_limit_warning: "Warning",
        title_image_max_size_limit: "Max size limit 30 MB",
        title_video_max_size_limit: "Max size limit 30 MB",
        title_video_max_duration_limit: "Max. video duration 30 seconds",
        title_media_format_unsupported: "Media format is not supported",
        title_camera_button: "Tap for photo, hold for video",
        ios_gallery_permission_warning_label: "You did not allow the app to access the entire gallery",
        ios_gallery_permission_warning_manage_button: "Manage",
        ios_gallery_permission_select_other_files_button: "Change the choice...",
        ios_gallery_permission_open_settings_button: "Open settings",
        ios_storage_permission_warning_label: "Allow access to your photos and videos",
        ios_storage_permission_warning_message: "This allows you to share photos and videos from your library. Go to settings and press «Photo».",
        ios_recording_permission_warning_label: "Allow access to your camera and microphone",
        ios_recording_permission_warning_message:
            "To continue working, access to the camera must be granted. Go to your settings and tap «Camera» and «Microphone».",
        ios_camera_limits_orientation: "To work with the camera, you need to turn the tablet to the vertical position",
        ios_camera_limits_multitasking: "To work with the camera, it is necessary to exit SplitView mode",
        ios_camera_limits_all: "To work with the camera, you need to turn the tablet to a vertical orientation and exit SplitView mode",
    },
    ru: {
        dialog_button_not_now: "Не сейчас",
        dialog_button_settings: "Настройки",
        button_no_gallery_access: "Нажмите, чтобы разрешить доступ к вашей галерее",
        dialog_storage_permission_warning:
            "Вам нужен доступ к хранилищу для загрузки фотографий и видео. Нажмите «Настройки» > «Разрешения» и включите «Файлы и мультимедиа».",
        dialog_photo_permissions_warning: "Вам нужен доступ к камере, чтобы делать фотографии. Нажмите «Настройки» > «Разрешения» и включите «Камеру».",
        dialog_video_permissions_warning:
            "Для создания видео вам потребуется доступ к камере и микрофону. Нажмите «Настройки» > «Разрешения» и включите «Камера» и «Микрофон».",
        warns_file_picker_files_limit: "Можно выбрать не более 10-ти файлов",
        title_storage_permission_warning: "Разрешить доступ к вашим фотографиям и видеозаписям",
        title_file_limit_warning: "Предупреждение",
        title_image_max_size_limit: "Макс. размер 30 МБ",
        title_video_max_size_limit: "Макс. размер 30 МБ",
        title_video_max_duration_limit: "Макс. длительность видео 30 секунд",
        title_media_format_unsupported: "Формат медиа не поддерживается",
        title_camera_button: "Нажмите для фото, удерживайте для видео",
        ios_gallery_permission_warning_label: "Вы не разрешили приложению доступ ко всей галерее",
        ios_gallery_permission_warning_manage_button: "Управлять",
        ios_gallery_permission_select_other_files_button: "Изменить выбор...",
        ios_gallery_permission_open_settings_button: "Открыть настройки",
        ios_storage_permission_warning_label: "Разрешить доступ к вашим фотографиям и видео",
        ios_storage_permission_warning_message: "Это позволяет делиться снимками и видео из вашей библиотеки. Зайдите в настройки и нажмите «Фото».",
        ios_recording_permission_warning_label: "Разрешить доступ к камере и микрофону",
        ios_recording_permission_warning_message:
            "Для продолжения работы необходимо получить доступ к камере. Зайдите в настройки и нажмите «Камера» и «Микрофон».",
        ios_camera_limits_orientation: "Для работы с камерой, необходимо повернуть планшет в вертикальное положение",
        ios_camera_limits_multitasking: "Для работы с камерой, необходимо выйти из режима SplitView",
        ios_camera_limits_all: "Для работы с камерой, необходимо повернуть планшет в вертикальное положение и выйти из режима SplitView",
    },
};

const configBase = {
    filePickerImageMaxSizeInBytes: 31457280,
    filePickerVideoMaxSizeInBytes: 31457280,
    filePickerVideoMaxLengthInSeconds: 30,
    filePickerFilesLimit: 10,
};

type Config = typeof configBase & { messages: (typeof messages)[typeof defaultLang] };

const isLangKeyofMessages = (lang: string): lang is keyof typeof messages => Object.keys(messages).includes(lang);

export const openFilePicker = async <T extends FilePickerResultType = FilePickerResultType.FileList | FilePickerResultType.LocalFileList>({
    accept,
    multiple,
    resultAsFiles,
    lang,
}: OpenFilePickerProps): Promise<FilePickerResult<T>> => {
    const id = uuidV4();

    let configLang: keyof typeof messages = defaultLang;
    if (isLangKeyofMessages(lang)) {
        configLang = lang;
    }

    const config: Config = { ...configBase, messages: messages[configLang] };

    const result = new Promise<FilePickerResult<T>>((resolve, reject) => {
        const resolveFromBlobs = (blobs: Array<() => Promise<File>>): void => {
            const promises = new Array<Promise<File>>();

            blobs.forEach(blob => {
                promises.push(blob());
            });

            Promise.all(promises).then(files => {
                resolve({
                    filePickerResultType: FilePickerResultType.FileList,
                    files: files as unknown as FileList,
                } as FilePickerResult<T>);
            });
        };

        const fileListCb = (response: Array<string>) => {
            // console.log({response});
            if (response && Array.isArray(response) && response.length > 0) {
                // https://qna.habr.com/q/895163
                // Create a files collection:
                // ios 14.5+
                // const dataTransfer = new DataTransfer();

                const blobs = new Array<() => Promise<File>>();

                response.forEach(src => {
                    blobs.push(async () => {
                        let blob: Blob = null!;
                        try {
                            blob = await (await fetch(src)).blob();
                        } catch (e) {
                            logError(e);
                            throw e;
                        }
                        const fileName = src.split("\\").pop()?.split("/").pop() || "image";
                        // dataTransfer.items.add(new File([blob], fileName, {
                        //     type: blob.type,
                        //     lastModified: new Date().getTime()
                        // }));

                        return new File([blob], fileName, {
                            type: blob.type,
                            lastModified: new Date().getTime(),
                        });
                    });
                });
                // console.log({dataTransfer});
                // resolve(dataTransfer.files);

                resolveFromBlobs(blobs);
            } else {
                // console.log("Empty resp");
                reject("FilePicker dismiss");
            }
        };

        const localFileListCb = (response: Array<SDKFileResponse>) => {
            // console.log({response});
            if (response && Array.isArray(response) && response.length > 0) {
                // https://qna.habr.com/q/895163
                // Create a files collection:
                // ios 14.5+
                // const dataTransfer = new DataTransfer();

                const files: LocalFileList = new Array();
                response.forEach(sdkFileResponse => {
                    const filePath = sdkFileResponse.path;
                    const type: LocalFile["type"] = sdkFileResponse.type;

                    // if (customSchemePath.indexOf("assets-video://") === 0) {
                    //     // filePath = customSchemePath.replace("assets-video://", "file://");
                    //     type = "video";
                    // } else if (customSchemePath.indexOf("assets-image://") === 0) {
                    //     // filePath = customSchemePath.replace("assets-image://", "file://");
                    //     type = "image";
                    // }

                    const fileName = filePath.split("\\").pop()?.split("/").pop() || "image";

                    files.push({
                        path: filePath,
                        name: fileName,
                        type,
                        width: sdkFileResponse.width,
                        height: sdkFileResponse.height,
                        poster: sdkFileResponse.poster,
                        hasAudio: sdkFileResponse.hasAudio,
                        duration: sdkFileResponse.duration,
                        getBlob: async () => {
                            const fetchPath = sdkFileResponse.fetchPath;
                            let blob: Blob = null!;
                            try {
                                blob = await (await fetch(fetchPath)).blob();
                            } catch (e) {
                                logError(e);
                                throw e;
                            }
                            return new File([blob], fileName, {
                                type: blob.type,
                                lastModified: new Date().getTime(),
                            });
                        },
                    });
                });

                if (resultAsFiles) {
                    resolveFromBlobs(files.map(item => item.getBlob));
                } else {
                    resolve({ filePickerResultType: FilePickerResultType.LocalFileList, files } as FilePickerResult<T>);
                }
            } else {
                reject("FilePicker dismiss");
            }
        };

        asyncQueue.set(id, hasFilePickerApiLocalFileListSupport() ? localFileListCb : fileListCb);
    });

    if (isIos && iosMh.openFilePicker !== undefined) {
        iosMh.openFilePicker.postMessage(
            JSON.stringify({
                id,
                accept,
                multiple,
                cb: "sdkCb",
                config,
            })
        );
        return result;
    } else if (isAndroid && window.Android.openFilePicker !== undefined) {
        window.Android.openFilePicker(JSON.stringify({ id, accept, multiple, cb: "sdkCb", config }));

        return result;
    } else {
        throw new Error("Not implemented");
    }
};

export const hasFilePickerApi = () => {
    let hasSupport = false;
    if (isAndroid && window.Android.openFilePicker !== undefined) {
        if (window.Android.hasFilePicker !== undefined) {
            hasSupport = window.Android.hasFilePicker();
        }
    }
    if (isIos && iosMh.openFilePicker !== undefined) {
        hasSupport = true;
    }

    return hasSupport;
};

const hasFilePickerApiLocalFileListSupport = () => {
    let hasSupport = false;
    if (isIos) {
        hasSupport = true;
    }

    return hasSupport;
};
