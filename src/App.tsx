import { Component, createEffect, createSignal, onCleanup, onMount } from 'solid-js';

const badgeIcons: Record<string, string> = {
  broadcaster: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1',
  premium: 'https://static-cdn.jtvnw.net/badges/v1/a1dd5073-19c3-4911-8cb4-c464a7bc1510/1',
};

const App: Component = () => {
  const [messages, setMessages] = createSignal<any[]>([]);
  const maxMessages = 25;
  let chatContainer: HTMLDivElement | undefined;
  let pingInterval: number;

  onMount(() => {
    const ws = new WebSocket('ws://localhost:4000/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((msgs) => {
        const updatedMessages = [...msgs, data];
        if (updatedMessages.length > maxMessages) {
          return updatedMessages.slice(updatedMessages.length - maxMessages);
        }
        return updatedMessages;
      });
    };

    ws.onopen = () => {
      pingInterval = window.setInterval(() => {
        ws.send(JSON.stringify({ type: 'ping' }));
      }, 25000);
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
    };

    onCleanup(() => {
      ws.close();
      clearInterval(pingInterval);
    });
  });

  const scrollToBottom = () => {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  createEffect(() => {
    if (messages().length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    }
  });

const logoSizes = {
  twitch: 'w-[30px]',
  kick: 'w-[30px] mb-2 pr-1',
  youtube: 'w-[30px]' 
};


const getLogoProps = (platform: string) => {
  switch (platform) {
    case 'kick':
      return { src: '/src/assets/kick.webp', size: logoSizes.kick };
    case 'twitch':
      return { src: '/src/assets/twitch.svg', size: logoSizes.twitch };
    case 'youtube':
      return { src: '/src/assets/youtube.svg', size: logoSizes.youtube };
    default:
      return { src: '/src/assets/default.svg', size: logoSizes.twitch };
  }
};

return (
  <div class="p-5 h-screen overflow-y-auto no-scrollbar" ref={(el) => (chatContainer = el)}>
    <ul class="flex flex-col gap-5">
      {messages().map((data) => {
        const { src, size } = getLogoProps(data.streamy.platform);

        return (
          <div id={data.message.id} class="bg-[#181818] w-full p-5 rounded-2xl">
            <p class="text-white text-3xl font-bold">
              <img 
                src={src}
                class={`mr-2 mb-1 inline ${size}`} 
                alt={data.streamy.platform}
              />
              <span 
                style={{ color: data.sender.color || "#" + (Math.random() * 0xFFFFFF << 0).toString(16) }} 
                class="mr-3 inline"
              >
                {data.sender.displayName}
              </span>
              {/* <span class="inline">
                {Array.from(data.sender.badges).map((badge: any) => (
                  <img
                    src={badgeIcons[badge]}
                    alt={badge}
                    class="w-[30px] inline mr-1"
                  />
                ))}
              </span> */}
              <span class="inline">{data.message.content}</span>
            </p>
          </div>
        );
      })}
    </ul>
  </div>
);
};

export default App;