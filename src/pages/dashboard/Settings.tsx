import { useRef, useState } from 'react'
import { IconDownload, IconUpload, IconSearch, IconTrash } from '@tabler/icons-react'
import { adminApi } from '@/lib/adminApi'
import Button from '@/components/Button/Button.tsx'
import classes from './Settings.module.scss'

type Busy = 'export' | 'import' | 'cos-scan' | 'cos-clean' | null

interface CosScanSummary {
  orphanTotal: number
  totalCosObjects: number
  knownUuids: number
  orphans: { bucket: string; prefix: string; keys: string[] }[]
}

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [message, setMessage] = useState<
    { kind: 'ok' | 'err'; text: string } | null
  >(null)
  const [scan, setScan] = useState<CosScanSummary | null>(null)

  const handleExport = async () => {
    setBusy('export')
    setMessage(null)
    try {
      await adminApi.db.exportDownload()
      setMessage({ kind: 'ok', text: '导出成功，已开始下载' })
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : '导出失败' })
    } finally {
      setBusy(null)
    }
  }

  const handleImportFile = async (file: File) => {
    setBusy('import')
    setMessage(null)
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      const result = await adminApi.db.import(payload)
      setMessage({
        kind: 'ok',
        text: `导入完成：作者 ${result.artists} 条，图片 ${result.albums} 条，友链 ${result.friends} 条`,
      })
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : '导入失败' })
    } finally {
      setBusy(null)
    }
  }

  const handleCosScan = async () => {
    setBusy('cos-scan')
    setMessage(null)
    try {
      const result = await adminApi.cos.reconcile(false)
      setScan({
        orphanTotal: result.orphanTotal,
        totalCosObjects: result.totalCosObjects,
        knownUuids: result.knownUuids,
        orphans: result.orphansByLocation.map((loc) => ({
          bucket: loc.bucket,
          prefix: loc.prefix,
          keys: loc.orphans,
        })),
      })
      setMessage({
        kind: 'ok',
        text: `扫描完成：存储桶共 ${result.totalCosObjects} 个对象，其中未引用 ${result.orphanTotal} 个`,
      })
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : '扫描失败' })
    } finally {
      setBusy(null)
    }
  }

  const handleCosClean = async () => {
    if (!scan || scan.orphanTotal === 0) return
    const confirmed = confirm(
      `即将永久删除存储桶里 ${scan.orphanTotal} 个未引用对象。是否继续？`,
    )
    if (!confirmed) return
    setBusy('cos-clean')
    setMessage(null)
    try {
      const result = await adminApi.cos.reconcile(true)
      setScan(null)
      setMessage({
        kind: 'ok',
        text: `清理完成：删除 ${result.deleted} 个，失败 ${result.failed} 个`,
      })
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : '清理失败' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={classes.page}>
      <h2 className={classes.heading}>备份</h2>

      <div className={classes.section}>
        <div className={classes.sectionHead}>
          <h3>导出</h3>
          <p>把当前相册、作者和友链数据打包成 JSON 下载，可以作备份或迁移。</p>
        </div>
        <Button
          className={classes.actionBtn}
          color="primary"
          onClick={handleExport}
          disabled={busy !== null}
          loading={busy === 'export'}
          leftIcon={<IconDownload size={16} stroke={2.5} />}
        >
          导出 JSON
        </Button>
      </div>

      <div className={classes.section}>
        <div className={classes.sectionHead}>
          <h3>导入</h3>
          <p>从之前导出的 JSON 恢复数据。按 ID 合并：同 ID 会被更新；不会删除目标库中多出的条目。</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
        <Button
          className={classes.actionBtn}
          color="white"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy !== null}
          loading={busy === 'import'}
          leftIcon={<IconUpload size={16} stroke={2.5} />}
        >
          选择 JSON 文件
        </Button>
      </div>

      <h2 className={classes.heading}>存储桶</h2>

      <div className={classes.section}>
        <div className={classes.sectionHead}>
          <h3>扫描未引用对象</h3>
          <p>
            对比数据库记录和存储桶里的实际对象，列出没有被任何图片引用的。
            只扫描，不删除。
          </p>
        </div>
        <Button
          className={classes.actionBtn}
          color="white"
          onClick={handleCosScan}
          disabled={busy !== null}
          loading={busy === 'cos-scan'}
          leftIcon={<IconSearch size={16} stroke={2.5} />}
        >
          开始扫描
        </Button>

        {scan && (
          <div className={classes.scanResult}>
            <div className={classes.scanStats}>
              <span>存储桶对象：{scan.totalCosObjects}</span>
              <span>数据库已知 UUID：{scan.knownUuids}</span>
              <span className={classes.scanOrphan}>未引用：{scan.orphanTotal}</span>
            </div>
            {scan.orphans.map(
              (loc) =>
                loc.keys.length > 0 && (
                  <details key={`${loc.bucket}/${loc.prefix}`} className={classes.scanGroup}>
                    <summary>
                      {loc.bucket}/{loc.prefix}/ ({loc.keys.length})
                    </summary>
                    <ul>
                      {loc.keys.map((k) => (
                        <li key={k}>{k}</li>
                      ))}
                    </ul>
                  </details>
                ),
            )}
          </div>
        )}
      </div>

      {scan && scan.orphanTotal > 0 && (
        <div className={classes.section}>
          <div className={classes.sectionHead}>
            <h3>清理未引用对象</h3>
            <p>
              将永久删除上面列出的 {scan.orphanTotal} 个对象。
              <strong>请先确认数据库是完整的</strong>
              ——如果数据库被清空过，所有存储桶对象都会被视为未引用。
            </p>
          </div>
          <Button
            className={classes.actionBtn}
            color="danger"
            onClick={handleCosClean}
            disabled={busy !== null}
            loading={busy === 'cos-clean'}
            leftIcon={<IconTrash size={16} stroke={2.5} />}
          >
            清理 {scan.orphanTotal} 个对象
          </Button>
        </div>
      )}

      {message && (
        <div
          className={`${classes.message} ${
            message.kind === 'ok' ? classes.ok : classes.err
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
