import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useChatContext } from '~/Providers';
import { useRequiresKey } from '~/hooks';
import AttachFile from './Files/AttachFile';
import StopButton from './StopButton';
import SendButton from './SendButton';
import FileRow from './Files/FileRow';
import Textarea from './Textarea';
import store from '~/store';
import { useSpeechToText, useSpeechToTextExternal } from '~/hooks';
import { useGetStartupConfig } from 'librechat-data-provider/react-query';

export default function ChatForm({ index = 0 }) {
  const [text, setText] = useRecoilState(store.textByIndex(index));
  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));

  const {
    ask,
    files,
    setFiles,
    conversation,
    isSubmitting,
    handleStopGenerating,
    filesLoading,
    setFilesLoading,
  } = useChatContext();

  const submitMessage = () => {
    ask({ text });
    setText('');
  };

  const { requiresKey } = useRequiresKey();
  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: null };
  const endpoint = endpointType ?? _endpoint;
  const { data: startupConfig } = useGetStartupConfig();
  const useExternalSpeech = startupConfig?.textToSpeechExternal;

  const {
    isListening: speechIsListening,
    isLoading: speechIsLoading,
    text: speechText,
  } = useSpeechToText();

  const {
    isListening: externalIsListening,
    isLoading: externalIsLoading,
    text: externalSpeechText,
  } = useSpeechToTextExternal();

  const isListening = useExternalSpeech ? externalIsListening : speechIsListening;
  const isLoading = useExternalSpeech ? externalIsLoading : speechIsLoading;
  const speechTextForm = useExternalSpeech ? externalSpeechText : speechText;
  const finalText = speechText || externalSpeechText ? speechTextForm : text;

  useEffect(() => {
    return setText(finalText);
  }, [finalText, setText]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMessage();
      }}
      className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
    >
      <div className="relative flex h-full flex-1 items-stretch md:flex-col">
        <div className="flex w-full items-center">
          <div className="[&:has(textarea:focus)]:border-token-border-xheavy border-token-border-heavy shadow-xs dark:shadow-xs relative flex w-full flex-grow flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:shadow-[0_0_0_2px_rgba(52,53,65,0.95)] [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)]">
            <FileRow
              files={files}
              setFiles={setFiles}
              setFilesLoading={setFilesLoading}
              Wrapper={({ children }) => (
                <div className="mx-2 mt-2 flex flex-wrap gap-2 px-2.5 md:pl-0 md:pr-4">
                  {children}
                </div>
              )}
            />
            {endpoint && (
              <Textarea
                value={text}
                disabled={requiresKey}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                setText={setText}
                submitMessage={submitMessage}
                endpoint={_endpoint}
                endpointType={endpointType}
              />
            )}
            <AttachFile
              endpoint={_endpoint ?? ''}
              endpointType={endpointType}
              disabled={requiresKey}
            />
            {isSubmitting && showStopButton ? (
              <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
            ) : (
              endpoint && (
                <SendButton
                  text={text}
                  disabled={filesLoading || isSubmitting || requiresKey}
                  isListening={isListening}
                  isLoading={isLoading}
                />
              )
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
