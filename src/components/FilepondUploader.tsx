import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { nanoid } from "nanoid";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import { supabase } from "../lib/services/supabase";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { toast } from "sonner";
import { FilePondFile, FilePondInitialFile } from "filepond";
import { Label } from "./ui/label";
import { pinata } from "../lib/services/pinata";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface ServerProps {
  process: (
    fieldName: string,
    file: File,
    metadata: object,
    load: (uniqueFileId?: string | { [key: string]: any }) => void,
    error: (errorMessage: string) => void,
    progress: (shouldComplete: boolean, loaded: number, total: number) => void,
    abort: () => void,
    transfer: (base64Data: string) => void,
    options: object
  ) => void;
}

interface FilepondUploaderProps {
  label: string;
  setImage: (source: string) => void;
}

const FilepondUploader = ({ label, setImage }: FilepondUploaderProps) => {
  const [files, setFiles] = React.useState<FilePondFile[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleServer: ServerProps["process"] = async (
    fieldName,
    file,
    metadata,
    load,
    error,
    progress,
    abort,
    transfer,
    options
  ) => {
    if (file) {
      try {
        progress(false, 0, file.size);

        const upload = await pinata.upload.public.file(file, {
          metadata: { name: "academy-banner" },
        });

        if (upload) {
          const publicUrlData = `https://${
            import.meta.env.VITE_PINATA_GATEWAY_URL
          }/ipfs/${upload.cid}`;

          // Report progress as complete
          progress(true, file.size, file.size);
          progress(true, 1, 1);
          load(publicUrlData);

          // Set images
          setImage(publicUrlData);
          toast("Image successfully uploaded");
        }
      } catch (err: any) {
        console.log(err?.response);
        return {
          abort: () => {
            abort();
          },
        };
      }
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#18181b] h-24 rounded-md flex items-center justify-center">
        Loading
      </div>
    );
  }

  return (
    <div role="group" className="flex flex-col gap-y-2">
      <Label>{label}</Label>
      <FilePond
        files={files as unknown as FilePondInitialFile[]}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        server={{ process: handleServer } as never}
        name="file"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        className="filepond_wrap"
      />
    </div>
  );
};

export default FilepondUploader;
