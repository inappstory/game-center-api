export type OpenFilePickerProps = {
    accept: String;
    multiple: boolean;
    resultAsFiles: boolean;
    lang: string;
};

export type SDKFileResponse = {
    path: string;
    fetchPath: string;
    width: number;
    height: number;
    type: "image" | "video";
    poster?: string;
    hasAudio?: boolean;
    duration?: number;
};

export type LocalFile = {
    path: string;
    name: string;
    type: "video" | "image";
    width: number;
    height: number;
    poster?: string;
    hasAudio?: boolean;
    duration?: number;
    getBlob: () => Promise<File>;
};

export type LocalFileList = Array<LocalFile>;

export type PlatformNativeFileUploadProps = {
    localFilePath: string;
    uploadId: string;
};

export function isLocalFile(file: File | LocalFile): file is LocalFile {
    return (file as LocalFile).getBlob !== undefined;
}

export enum FilePickerResultType {
    Unknown,
    FileList,
    LocalFileList,
}

export type FilePickerResultPayload = {
    [FilePickerResultType.Unknown]: { filePickerResultType: FilePickerResultType.Unknown; files: FileList };
    [FilePickerResultType.FileList]: { filePickerResultType: FilePickerResultType.FileList; files: FileList };
    [FilePickerResultType.LocalFileList]: { filePickerResultType: FilePickerResultType.LocalFileList; files: LocalFileList };
};

export type FilePickerResult<T extends FilePickerResultType> = FilePickerResultPayload[T];

export function isFilePickerResultFileList(result: FilePickerResult<FilePickerResultType>): result is FilePickerResult<FilePickerResultType.FileList> {
    return result.filePickerResultType === FilePickerResultType.FileList;
}

export function isFilePickerResultLocalFileList(
    result: FilePickerResult<FilePickerResultType>
): result is FilePickerResult<FilePickerResultType.LocalFileList> {
    return result.filePickerResultType === FilePickerResultType.LocalFileList;
}
