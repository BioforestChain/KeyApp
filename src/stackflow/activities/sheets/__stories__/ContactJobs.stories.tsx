import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IconDownload as Download, IconLoader2 as Loader } from '@tabler/icons-react';
import { parseQRContent, generateContactQRContent, type ParsedContact } from '@/lib/qr-parser';
import { encodeAvatar, generateRandomAvatar, generateAvatarFromSeed } from '@/lib/avatar-codec';
import { ContactAvatar } from '@/components/common/contact-avatar';
import { Button } from '@/components/ui/button';
import { ContactCard } from '@/components/contact/contact-card';

const meta: Meta = {
  title: 'Sheets/ContactJobs',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

/** 联系人协议解析测试 */
export const ContactProtocolDemo: StoryObj = {
  render: () => {
    const [name, setName] = useState('张三');
    const [ethAddress, setEthAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f12345');
    const [btcAddress, setBtcAddress] = useState('');
    const [memo, setMemo] = useState('好友');

    const addresses = [
      ethAddress && { chainType: 'ethereum' as const, address: ethAddress },
      btcAddress && { chainType: 'bitcoin' as const, address: btcAddress },
    ].filter(Boolean) as { chainType: 'ethereum' | 'bitcoin' | 'tron'; address: string }[];

    const qrContent = generateContactQRContent({
      name,
      addresses,
    });

    const parsed = parseQRContent(qrContent);

    return (
      <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">联系人协议测试</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">备注</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ETH 地址</label>
          <input
            type="text"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">BTC 地址 (可选)</label>
          <input
            type="text"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
            placeholder="bc1..."
          />
        </div>

        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={qrContent} size={180} level="M" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">生成的二维码内容</label>
          <pre className="max-h-32 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(JSON.parse(qrContent), null, 2)}
          </pre>
        </div>

        <div className={`rounded p-3 ${parsed.type === 'contact' ? 'bg-green-100' : 'bg-red-100'}`}>
          {parsed.type === 'contact' ? (
            <div>
              <p className="font-medium text-green-800">✓ 解析为联系人</p>
              <p className="text-sm text-green-700">名称: {parsed.name}</p>
              <p className="text-sm text-green-700">地址数: {parsed.addresses.length}</p>
            </div>
          ) : (
            <p className="font-medium text-red-800">✗ 解析失败: {parsed.type}</p>
          )}
        </div>
      </div>
    );
  },
};

/** Avatar 编码演示 */
export const AvatarCodecDemo: StoryObj = {
  render: () => {
    const [avatarCode, setAvatarCode] = useState(() => {
      const config = generateRandomAvatar();
      return `avatar:${encodeAvatar(config)}`;
    });

    const regenerate = () => {
      const config = generateRandomAvatar();
      setAvatarCode(`avatar:${encodeAvatar(config)}`);
    };

    const fromSeed = (seed: string) => {
      const config = generateAvatarFromSeed(seed);
      setAvatarCode(`avatar:${encodeAvatar(config)}`);
    };

    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-lg font-semibold">Avatar 编码演示</h2>

        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src={avatarCode} size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">{avatarCode}</code>
            <span className="text-muted-foreground text-xs">8 字符 base64</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src="👨‍💼" size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">👨‍💼</code>
            <span className="text-muted-foreground text-xs">Emoji 回退</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src={undefined} size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">undefined</code>
            <span className="text-muted-foreground text-xs">默认头像</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={regenerate}>随机生成</Button>
          <Button variant="outline" onClick={() => fromSeed('alice')}>
            Seed: alice
          </Button>
          <Button variant="outline" onClick={() => fromSeed('bob')}>
            Seed: bob
          </Button>
        </div>
      </div>
    );
  },
};

/** 新版名片卡片样式 - 支持 snapdom 截图下载 */
export const ContactCardPreview: StoryObj = {
  render: () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [avatarCode] = useState(() => `avatar:${encodeAvatar(generateRandomAvatar())}`);

    const contact = {
      name: '张三',
      avatar: avatarCode,
      addresses: [
        { chainType: 'ethereum' as const, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' },
        { chainType: 'bitcoin' as const, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
      ],
    };

    const qrContent = generateContactQRContent(contact);

    const handleDownload = useCallback(async () => {
      const cardElement = cardRef.current;
      if (!cardElement || isDownloading) return;

      setIsDownloading(true);
      try {
        const { snapdom } = await import('@zumer/snapdom');
        await snapdom.download(cardElement, {
          type: 'png',
          filename: `contact-${contact.name}.png`,
          scale: 2,
          quality: 1,
        });
      } catch (error) {
        console.error('Download failed:', error);
      } finally {
        setIsDownloading(false);
      }
    }, [isDownloading]);

    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-lg font-semibold">新版名片卡片 (Avataaars + snapdom)</h2>
        <p className="text-muted-foreground text-sm">
          头像编码: <code className="rounded bg-slate-100 px-1">{avatarCode}</code>
        </p>

        <div ref={cardRef}>
          <ContactCard
            name={contact.name}
            avatar={contact.avatar}
            addresses={contact.addresses}
            qrContent={qrContent}
          />
        </div>

        <Button onClick={handleDownload} disabled={isDownloading} className="w-40">
          {isDownloading ? <Loader className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
          下载名片
        </Button>
      </div>
    );
  },
};

/** 边界条件测试 */
export const EdgeCases: StoryObj = {
  render: () => {
    const testCases = [
      {
        name: '正常联系人',
        content:
          '{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}',
      },
      {
        name: '多地址联系人',
        content:
          '{"type":"contact","name":"李四","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{"chainType":"bitcoin","address":"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}]}',
      },
      {
        name: '带备注和头像',
        content:
          '{"type":"contact","name":"王五","addresses":[{"chainType":"tron","address":"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW"}],"memo":"老板","avatar":"👨‍💼"}',
      },
      {
        name: 'URI 格式',
        content: 'contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&memo=好友',
      },
      {
        name: '空名称 (无效)',
        content:
          '{"type":"contact","name":"","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}',
      },
      {
        name: '空地址列表 (无效)',
        content: '{"type":"contact","name":"测试","addresses":[]}',
      },
      {
        name: '非联系人 JSON',
        content: '{"type":"other","data":"test"}',
      },
      {
        name: '普通地址',
        content: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345',
      },
    ];

    return (
      <div className="w-[600px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">边界条件测试</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">用例</th>
              <th className="py-2 text-left">解析类型</th>
              <th className="py-2 text-left">结果</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => {
              const parsed = parseQRContent(tc.content);
              const isContact = parsed.type === 'contact';
              const contactParsed = parsed as ParsedContact;

              return (
                <tr key={tc.name} className="border-b">
                  <td className="py-2 font-medium">{tc.name}</td>
                  <td className="py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        isContact ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {parsed.type}
                    </span>
                  </td>
                  <td className="py-2 text-xs">
                    {isContact ? (
                      <span>
                        {contactParsed.name} ({contactParsed.addresses.length} 地址)
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
};
